// author: Dani Nelson
"use strict";
(function ($) {
  // GLOBAL NAMESPACE
  window.APP_DESIGN_STUDIO = {
    appDesignStudio: angular.module("appDesignStudio", [
      "ngAnimate",
      "ngSanitize",
      "ngQuill",
    ]),
    eventId: $("input#event").val(),
    userId: $("input#userId").val(),
    userProfile: $("input#userProfile").val(),
    departureId: $("input#currentDepartureId").val(),
    tripId: $("input#currentTripId").val(),
  };

  // native JavaScript
  //DECODE CHARACTERS
  function decodeCharacters(str) {
    return str
      .replace(/amp;/g, "")
      .replace(/lt;/g, "<")
      .replace(/gt;/g, ">")
      .replace(/&&/g, "&")
      .replace(/&quot;/g, "'")
      .replace(/&</, "<")
      .replace(/&>/, ">")
      .replace(/%20/g, " ")
      .replace(/%22/g, '&#39;"')
      .replace(/&#39;/, "'")
      .replace(/&#39;/, "'");
  }

  //SET UP DYNAMIC ALERT MESSAGE
  function showAlert(msg) {
    $("div#alert-error-message").html(msg);
    $("div#alert-error").fadeIn();
    setTimeout(function () {
      $("div#alert-error-message").html("");
      $("div#alert-error").fadeOut();
    }, 10000);
  }

  function showWarningAlert(msg) {
    $("span#warning-error-message").text(msg);
    $("div#warning-error").fadeIn();
  }

  //HIDE ALL ALERTS TILL NEEDED
  function hideAlert() {
    $(
      "div#alert-error, div#warning-error, i#fa-loader-employee-skill, i#fa-loader-events-updated, i#fa-loader-update-events"
    ).hide();
  }

  // MAP FILTERING
  $("#host input:checkbox").change(function () {
    var x = [];
    var j = "";
    var cat = "";
    var i;
    var hasChecked = false;
    $("#host input:checkbox:checked").each(function () {
      hasChecked = true;
      x.push($(this).val());
      console.log(x);
      j = x.toString().split(" - ");
      console.log(j);

      for (i = 0; i < window.allMarkers.length; i++) {
        var marker;
        marker = gmarkers2[i];

        if (x.indexOf(marker.category) >= 0) {
          marker.setVisible(true);
          console.log(marker.title + " (" + marker.category + "): true");
        } else if (
          x.indexOf("Activities") >= 0 &&
          marker.category == "Guide Service"
        ) {
          marker.setVisible(true);
          console.log(marker.title + " (" + marker.category + "): true");
        } else if (
          x.indexOf("Other") >= 0 &&
          (marker.category == "Transportation" ||
            marker.category == "Other" ||
            marker.category == "Food &amp; Beverage" ||
            marker.category == "Admin")
        ) {
          marker.setVisible(true);
          console.log(marker.title + " (" + marker.category + "): true");
        } else {
          marker.setVisible(false);
          console.log(marker.title + " (" + marker.category + "): false");
        }
      }
    });
    if (!hasChecked) {
      console.log("nothing is checked");
      for (i = 0; i < window.allMarkers.length; i++) {
        var marker;
        marker = gmarkers2[i];
        marker.setVisible(true);
      }
    }
  });

  function highlightRecord(id) {
    $(`input#${id}`).addClass("selected-date");
  }
  function highlightWeekendRecord(id) {
    $(`input#${id}`).addClass("selected-weekend-date");
  }
  $("i#fa-loader-update-report").hide();

  var map;
  var gmarkers1 = [];
  var gmarkers2 = [];
  var markers1 = [];
  var desitinationCenter = [];

  var infowindow = new google.maps.InfoWindow({
    content: "",
  });

  var geocoder;

  //Needed to initialize map
  function initMap() {}

  $(document).ready(function () {
    initMap = function () {
      var center = new google.maps.LatLng(42.0568922, -110.1406513);
      var mapOptions = {
        zoom: 5,
        center: center,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        options: {
          gestureHandling: "greedy",
        },
      };

      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      var i;
      for (i = 0; i < markers1.length; i++) {
        addMarker(markers1[i]);
      }

      function addMarker(marker) {
        var category = marker[4];
        var title = marker[1];
        var pos = new google.maps.LatLng(marker[2], marker[3]);
        var content = marker[1];
        var marker1;

        marker1 = new google.maps.Marker({
          title: title,
          position: pos,
          category: category,
          map: map,
        });

        gmarkers1.push(marker1);

        // Marker click listener
        google.maps.event.addListener(
          marker1,
          "click",
          (function (marker1, content) {
            return function () {
              //console.log('Gmarker 1 gets pushed');
              infowindow.setContent(content);
              infowindow.open(map, marker1);
              map.panTo(this.getPosition());
              map.setZoom(15);
            };
          })(marker1, content)
        );
      }
    };

    initMap();
  });

  APP_DESIGN_STUDIO.appDesignStudio.controller("ControllerDesignStudio", [
    "$scope",
    "$sce",
    "$filter",
    function ($scope, $sce, $filter) {
      // DECLARE AND INITIALIZE $scope VARIABLES
      $scope.currentYear = new Date().getFullYear();
      $scope.todaysDate = moment().format("ll");

      // map scopes
      $scope.destinationAddress = $("#inputDest").val();
      $scope.searchDests = "";
      $scope.allMarkers = [];
      window.allMarkers = $scope.allMarkers;

      // set map view by searching destination
      $scope.enterDest = "";
      // set map view backed on trip region (Trip_Region__c FROM Trip__c)
      $scope.setRegion = "";

      $scope.destinationMarkers = [];
      $scope.vendorMarkers = [];
      $scope.vendorModal = {};
      // vendorExp holds selected value
      $scope.vendorExp = {};
      // expArr holds all experiences available for vendor
      $scope.expArr = [];

      // segment/calendar scopes
      $scope.user = {};
      // for on page entry start/end date
      $scope.tripStartDate = "";
      $scope.tripEndDate = "";

      // DEPARTURE VARIABLES
      $scope.noDeparture = true;
      //$scope.departures = ''; //JCD - 2019-02-14 - Changed to array.
      $scope.departures = [];
      $scope.departureStartDate = "";
      $scope.departureEndDate = "";
      $scope.saveDeparture = {};

      $scope.segments = [];
      $scope.selectedDay = "";
      // day when clicked on date header
      $scope.clickedDate = {};
      $scope.selectedSegment = {};
      $scope.newSegment = {};

      // draggable sidebar destinations
      $scope.destinations = {};

      // segment destinations/days
      $scope.segmentModal = [];
      $scope.segmentModalReservations = [];
      $scope.showSegmentReservationLabel = true;
      $scope.segmentModalDestinations = [];
      $scope.showSegmentDestinationLabel = true;

      $scope.segmentDest = [];
      $scope.selectedDest = {};
      $scope.segmentDays = [];
      $scope.newDest = {};
      $scope.newDay = {};
      $scope.holdDay = {};
      $scope.dayDate = "";
      $scope.fetchClickedDate = "";
      $scope.dayModal = {};
      $scope.destToDelete = {};
      $scope.dayToDelete = {};
      $scope.destinationModal = {};
      $scope.destinationSeg = {};

      // if launching Modal from Map vs Calendar. If from map is true
      $scope.isDestinationFromMap = false;

      // segment reservations
      $scope.segmentRes = [];
      $scope.segmentLodgingRes = [];
      $scope.selectedRes = {};
      $scope.newRes = {};
      $scope.reservationModal = [];
      $scope.reservationSeg = {};
      // segment routes
      $scope.dayRoute = [];
      $scope.allRoutes = [];
      $scope.routeModal = {};
      // buttonSelectedRoute hold value from button "add route" dropdown
      $scope.buttonSelectedRoute = {};
      // hold value from search dest button dropdown
      $scope.buttonSelectedDest = {};
      // selectedRoute holds selected route value
      $scope.selectedRoute = {};
      // date selection from add route button
      $scope.routeDate = "";
      $scope.newRoute = {};

      // test to pass for updates to existing segment
      $scope.passedTest = false;
      $scope.existingDay = false;
      $scope.existingDest = false;
      $scope.existingRoute = false;
      $scope.isRoute = false;
      $scope.isDestination = false;

      $scope.destinationForGelocation = {};
      $scope.newRoute = {};

      //$scope.segmentsMaxEndDate = null;

      $scope.toUTCDate = function (date) {
        var _utc = new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds()
        );
        return _utc;
      };

      $scope.millisToUTCDate = function (millis) {
        return $scope.toUTCDate(new Date(millis));
      };

      $scope.decodeHTML = function (html) {
        var textArea = document.createElement("textarea");
        textArea.innerHTML = html;
        return textArea.value;
        /*let decodedHTML = html.trim();
            decodedHTML = decodedHTML.replace(new RegExp("&amp;","gi"),"&").replace(new RegExp("&lt;","gi"),"<").replace(new RegExp("&#60;","gi"),"<").replace(new RegExp("&gt;","gi"),">").replace(new RegExp("&#62;","gi"),">");

            return decodedHTML;*/
      };

      //---------------------------------------
      //---------------------BEGIN DATE SEG DEV

      $scope.addDeparture = function () {
        $("div#create-dept").modal("show");
        console.log(APP_DESIGN_STUDIO.departureId);
      };

      $scope.createOrUpdateDeparture = function () {
        if (!$scope.tripEndDate) $scope.tripEndDate = $scope.tripStartDate;
        if (!$scope.tripStartDate && !$scope.tripEndDate) {
          alert("No changes to save");
          return; // no changes made
        }

        if (APP_DESIGN_STUDIO.departureId)
          $scope.saveDeparture.Id = APP_DESIGN_STUDIO.departureId;
        $scope.saveDeparture.Trip__c = APP_DESIGN_STUDIO.tripId;
        if ($scope.tripStartDate)
          $scope.saveDeparture.StartDate__c = moment
            .utc($scope.tripStartDate)
            .format("x");
        if ($scope.tripEndDate)
          $scope.saveDeparture.EndDate__c = moment
            .utc($scope.tripEndDate)
            .format("x");
        $("#myPage").addClass("reloading");
        designStudio.createDeparture(
          $scope.saveDeparture,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.departures = result;
              $scope.noDeparture = false;
              $scope.getDepartures();
              setTimeout(function () {
                location.reload();
                $("div#modal-trip-dates").modal("hide");
                $("div#create-dept").modal("hide");
              }, 1000);
            } else {
              showAlert("Departure not created");
              $scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.refreshPage = function () {
        location.reload();
      };

      $scope.enterTripDate = function () {
        $scope.tripStartDate = "";
        $scope.tripEndDate = "";
        $("div#modal-trip-dates").modal("show");
      };

      $scope.to_trusted = function (html_code) {
        return $sce.trustAsHtml(html_code);
      };

      //get destinations for map sidebar based on primary destination
      $scope.getDestinations = function () {
        $("#myPage").addClass("reloading");
        designStudio.getDestinations(
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              console.log(result);
              //$scope.destinations = JSON.stringify(result);
              $scope.destinations = result;
              //let plaindest = result;
              console.log("DESTINATIONS ->", $scope.destinations);
              setTimeout(function () {
                console.log("Destinations ready to drag and drop");
                $("#external-events .fc-event").each(function () {
                  // store data so the calendar knows to render an event upon drop
                  $(this).data("event", {
                    title: $.trim($(this).find("#event-name").text()),
                    //title: $.trim($(this).text()), // use the element's text as the event title
                    id: $.trim($(this).find("#event-id").text()),
                    stick: true, // maintain when user navigates (see docs on the renderEvent method)
                  });
                  // make the event draggable using jQuery UI
                  $(this).draggable({
                    zIndex: 999,
                    revert: true, // will cause the event to go back to its
                    revertDuration: 0, //  original position after the drag
                  });
                });
              }, 1000);
              $scope.$apply();
              $("i#fa-loader-get-user").hide();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getDestinations();

      //get destinations attached to existing segments
      $scope.getSegmentDestinations = function () {
        $("#myPage").addClass("reloading");
        designStudio.getSegmentDestinations(
          APP_DESIGN_STUDIO.departureId,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              console.log(result);
              var segDestArr = result;
              for (var i = 0; i < segDestArr.length; i++) {
                if (segDestArr[i].Destination__r.Background__c == null) {
                  segDestArr[i].Destination__r.Background__c = "Awaiting data";
                }
                if (segDestArr[i].Destination__r.Name == null) {
                  segDestArr[i].Destination__r.Name = "Awaiting data";
                }
                if (
                  segDestArr[i].Destination__r.Things_to_See_and_Do__c == null
                ) {
                  segDestArr[i].Destination__r.Things_to_See_and_Do__c =
                    "Awaiting data";
                }
                if (segDestArr[i].Destination__r.Narrative__c == null) {
                  segDestArr[i].Destination__r.Narrative__c = "Awaiting data";
                }

                $scope.segmentDest.push({
                  allDay: true,
                  editable: true,
                  title: decodeCharacters(segDestArr[i].Destination__r.Name),
                  start: segDestArr[i].Day__r.Date__c,
                  id: segDestArr[i].Id,
                  dayid: segDestArr[i].Day__r.Id,
                  destid: segDestArr[i].Destination__r.Id,
                  Segment: segDestArr[i].Segment__r.Segment_Name__c,
                  SegmentId: segDestArr[i].Segment__r.Id,
                  Background: decodeCharacters(
                    segDestArr[i].Destination__r.Background__c
                  ),
                  ThingsAndStuff: decodeCharacters(
                    segDestArr[i].Destination__r.Things_to_See_and_Do__c
                  ),
                  Narr: segDestArr[i].Segment__r.Narrative__c,
                  verificationstatus:
                    segDestArr[i].Destination__r.Verification_Status__c,
                });

                $scope.segmentDays.push({
                  id: segDestArr[i].Day__r.Id,
                  day: segDestArr[i].Day__r.Date__c,
                });
              }

              console.log("SEGMENT DESTINATIONS: ", $scope.segmentDest);
              console.log("SEGMENT DAYS ", $scope.segmentDays);

              $scope.$apply();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getSegmentDestinations();

      //get reservations attached to existing segments
      $scope.getDepartureReservations = function () {
        $("#myPage").addClass("reloading");
        designStudio.getDepartureReservations(
          APP_DESIGN_STUDIO.departureId,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              var segResArr = result;
              for (var i = 0; i < segResArr.length; i++) {
                if (segResArr[i].RecordType.DeveloperName == "Lodging") {
                  $scope.segmentLodgingRes.push({
                    allDay: true,
                    editable: true,
                    title:
                      segResArr[i].Vendor__r.Name +
                      " - " +
                      segResArr[i].Experience_Name__c,
                    description: segResArr[i].Vendor__r.Name,
                    start: segResArr[i].StartDate__c,
                    //end: moment(segResArr[i].EndDate__c).add(2,'days'),
                    end: moment(segResArr[i].EndDate__c).add(1, "days"), // JCD - 2019-03-21 - Only add one day
                    id: segResArr[i].Id,
                    Segment: segResArr[i].Segment__r.Name,
                    url: window.location.hostname + "/" + segResArr[i].Id,
                  });
                } else {
                  //console.warn('THIS IS NOT LODGING');
                  $scope.segmentRes.push({
                    allDay: true,
                    editable: true,
                    title: segResArr[i].Experience_Name__c,
                    description: segResArr[i].Vendor__r.Name,
                    start: segResArr[i].StartDate__c,
                    end: moment(segResArr[i].EndDate__c).add(1, "days"),
                    id: segResArr[i].Id,
                    //dayid: segResArr[i].Day__r.Id,
                    Segment: segResArr[i].Segment__r.Name,
                    url: window.location.hostname + "/" + segResArr[i].Id,
                  });
                }
              }

              $scope.$apply();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getDepartureReservations();

      //Get days for routes to load routes on calendar
      $scope.getRouteDays = function () {
        //send new segment for insert
        $("#myPage").addClass("reloading");
        designStudio.getRouteDays(
          APP_DESIGN_STUDIO.departureId,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              //var routeArr = [];
              for (var i = 0; i < result.length; i++) {
                if (result[i].Route__c != null) {
                  $scope.dayRoute.push({
                    RouteId: result[i].Route__c,
                    title: result[i].Route__r.Name,
                    DayName: result[i].Name,
                    Id: result[i].Id,
                    Date: result[i].Date__c,
                    start: result[i].Date__c,
                    end: result[i].Date__c,
                    segment: result[i].Segment__c,
                    url: window.location.hostname + "/" + result[i].Route__c,
                    verificationstatus:
                      result[i].Route__r.Verification_Status__c,
                  });
                }
              }
              console.log(
                "THESE ARE ROUTES BY DAYS FOR CALENDAR ",
                $scope.dayRoute
              );
            } else {
              //showAlert('Segment not created');
              //$scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getRouteDays();

      //Get routes for add route button to add new routes
      $scope.getRoutes = function () {
        $("#myPage").addClass("reloading");
        designStudio.getRoutes(
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              for (var i = 0; i < result.length; i++) {
                $scope.allRoutes.push({
                  key: result[i].Id,
                  value: result[i].Name,
                  //date: result[i].Days__r.Date__c
                });
              }

              console.log("THESE ARE ALL THE ROUTES ", $scope.allRoutes);
            } else {
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getRoutes();

      // LOAD SEGMENTS
      $scope.getDepartures = function () {
        $("#myPage").addClass("reloading");
        designStudio.getDepartures(
          APP_DESIGN_STUDIO.departureId,
          APP_DESIGN_STUDIO.tripId,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.departures = result;

              var departSeg = [];
              for (var i = 0; i < $scope.departures.length; i++) {
                //get departure start and end date
                $scope.departureStartDate = $scope.departures[i].StartDate__c;
                $scope.departureEndDate = $scope.departures[i].EndDate__c;

                $scope.initDatePicker();

                if ($scope.departures[i] != null) {
                  $scope.noDeparture = false;
                  if ($scope.departures[i].Segments__r != null) {
                    departSeg.push($scope.departures[i].Segments__r);

                    for (var j = 0; j < departSeg[0].length; j++) {
                      if (!departSeg[0][j].PrimaryDestinationId__r) {
                        console.log("there is a primary destination");
                        $scope.segments.push({
                          title: departSeg[0][j].Segment_Name__c,
                          start: departSeg[0][j].StartDate__c,
                          //end: moment(departSeg[0][j].EndDate__c).add(2, 'days'), //JCD - 2019-02-11 -> Add two days
                          end: moment(departSeg[0][j].EndDate__c).add(
                            1,
                            "days"
                          ), //JCD - 2019-03-21 -> Added one day
                          allDay: true,
                          editable: true,
                          dragOpacity: 0.5,
                          id: departSeg[0][j].Id,
                          segmentName: departSeg[0][j].Segment_Name__c,
                          StartDate__c: departSeg[0][j].StartDate__c,
                          EndDate__c: departSeg[0][j].EndDate__c,
                        });
                      } else {
                        $scope.segments.push({
                          description: departSeg[0][j].Segment_Name__c,
                          title: departSeg[0][j].PrimaryDestinationId__r.Name,
                          start: departSeg[0][j].StartDate__c,
                          //end: moment(departSeg[0][j].EndDate__c).add(2, 'days'), //JCD - 2019-02-11 -> Add two days
                          end: moment(departSeg[0][j].EndDate__c).add(
                            1,
                            "days"
                          ), //JCD - 2019-03-21 -> Add one day
                          allDay: true,
                          editable: true,
                          dragOpacity: 0.5,
                          id: departSeg[0][j].Id,
                          segmentName: departSeg[0][j].Segment_Name__c,
                          StartDate__c: departSeg[0][j].StartDate__c,
                          EndDate__c: departSeg[0][j].EndDate__c,
                        });
                      }
                    }

                    console.log("SEGMENTS: ", $scope.segments);
                  }
                }
              }

              $scope.$apply();
              $("i#fa-loader-get-user").hide();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
            $(function () {
              setTimeout(function () {
                console.log("SEGMENTS After...: ", $scope.segments);
                $(".calendar-section").show();
                $scope.initFullCalendar();
                $scope.initFullCalendarTwo();
                $scope.initFullCalendarThree();
                $scope.initFullCalendarFour();
                $scope.initFullCalendarFive();
                $(".fc-day-header").click(function () {
                  var tempFetchedDate = $(this).data("date");
                  $scope.fetchClickedDate = moment(tempFetchedDate).format("l");
                  console.log(tempFetchedDate);
                  $scope.getDayMod($scope.fetchClickedDate);
                  $("div#day-modal").modal("show");
                });

                //calendar vars
                var $cal = $("div#calendar");
                var $caltwo = $("div#calendarTwo");
                var $calthree = $("div#calendarThree");
                var $calfour = $("div#calendarFour");
                var $calfive = $("div#calendarFive");

                //segments calendar
                $cal.fullCalendar("removeEvents");
                $cal.fullCalendar("removeEventSource", $scope.segments);
                $cal.fullCalendar("addEventSource", $scope.segments);
                $cal.fullCalendar("rerenderEvents");

                //destinations calendar
                $caltwo.fullCalendar("removeEvents");
                $caltwo.fullCalendar("removeEventSource", $scope.segmentDest);
                $caltwo.fullCalendar("addEventSource", $scope.segmentDest);
                $caltwo.fullCalendar("rerenderEvents");

                //reservations calendar
                $calthree.fullCalendar("removeEvents");
                $calthree.fullCalendar("removeEventSource", $scope.segmentRes);
                $calthree.fullCalendar("addEventSource", $scope.segmentRes);
                $calthree.fullCalendar("rerenderEvents");

                //lodging calendar
                $calfour.fullCalendar("removeEvents");
                $calfour.fullCalendar(
                  "removeEventSource",
                  $scope.segmentLodgingRes
                );
                $calfour.fullCalendar(
                  "addEventSource",
                  $scope.segmentLodgingRes
                );
                $calfour.fullCalendar("rerenderEvents");

                //route calendar
                $calfive.fullCalendar("removeEvents");
                $calfive.fullCalendar("removeEventSource", $scope.dayRoute);
                $calfive.fullCalendar("addEventSource", $scope.dayRoute);
                $calfive.fullCalendar("rerenderEvents");

                $scope.$apply();
              }, 600);
            });
          },
          { buffer: false, escape: false }
        );
      };
      $scope.getDepartures();
      $scope.checkRouteDaysBeforeUpdatingSegment = function (event) {
        console.log("DID WE MAKE IT");
        if ($scope.dayRoute === undefined || $scope.dayRoute.length == 0) {
          $scope.passedTest = true;
          console.log("there are no routes so keep going ");
        } else {
          for (var i = 0; i < $scope.dayRoute.length; i++) {
            console.log("almost");
            console.log($scope.dayRoute[i]);
            console.log(event);
            if ($scope.dayRoute[i].segment == event.id) {
              console.log("aaaalmost ", $scope.selectedSegment);

              if (
                $scope.selectedSegment.EndDate__c < $scope.dayRoute[i].start ||
                $scope.selectedSegment.StartDate__c > $scope.dayRoute[i].start
              ) {
                console.log("cant touch this");
                $scope.passedTest = false;

                alert(
                  "There is at least one associated record (destination or route) that exists on the day you are removing from this segment."
                );
                $scope.refreshCal();
                return;
              } else {
                $scope.passedTest = true;
              }
            } else {
              $scope.passedTest = true;
            }
          }
        }
      };

      //-------------------------------------
      //---------------------END DATE SEG DEV

      //-----------------------------------
      //---------------------BEGIN CAL INIT

      // initialize FullCalendar js{

      //---------------------BEGIN 1st CAL INIT - SEGMENTS
      $scope.initFullCalendar = function () {
        $("div#calendar").fullCalendar({
          contentHeight: "auto",
          dayClick: function (date) {
            $scope.selectedDay = moment(date).format("L");
          },
          defaultView: "basic",
          defaultDate: $scope.departureStartDate,
          visibleRange: {
            start: $scope.departureStartDate,
            end: moment($scope.departureEndDate).add(1, "days"),
          },
          header: {
            left: "",
            center: "title",
            right: "",
          },
          editable: true,
          eventStartEditable: true,
          eventDurationEditable: true,
          displayEventTime: false,
          droppable: true,
          drop: function () {
            if ($scope.destinations == null) {
              $(this).remove();
            }
            //alert(event.title + " was dragged to " + event.end.format());
          },
          eventClick: function (event) {
            $scope.getSegmentMod(event.id);
            $("#segment-modal").modal("show");
          },
          eventResize: function (event, jsEvent, view) {
            console.log("SEGEMENT eventResize");
            $scope.selectedSegment.EndDate__c = moment
              .utc(event.end)
              .subtract(1, "days")
              .format("x");
            $scope.selectedSegment.StartDate__c = moment
              .utc(event.start)
              .format("x");
            console.log(event);
            $scope.checkRouteDaysBeforeUpdatingSegment(event);
            if ($scope.passedTest == true) {
              console.log("PASSED TEST");
              if (!$scope.selectedSegment.Id) {
                console.log("selected segment HAS NO NAME i mean ID!");
                $scope.selectedSegment.Id = event.id;
              } else {
                console.log("SELECTED SEGMENT ID ", $scope.selectedSegment.Id);
              }
              console.log($scope.selectedSegment);
              $scope.updateSegment();
            }
          },
          eventDrop: function (event, delta, revertFunc) {
            console.log("SEGEMENT eventDrop");
            console.log(event);
            for (var i = 0; i < $scope.segments.length; i++) {
              if ($scope.segments[i].Id === event.id) {
                $scope.selectedSegment = $scope.segments[i];
                console.log("ANYTHING?");
                console.log($scope.segments[i]);
              }
            }
            $scope.selectedSegment.EndDate__c = moment
              .utc(event.end)
              .subtract(1, "days")
              .format("x");
            $scope.selectedSegment.StartDate__c = moment
              .utc(event.start)
              .format("x");
            $scope.selectedSegment.Id = event.id;
            console.log("HERE ", $scope.selectedSegment);

            $scope.checkRouteDaysBeforeUpdatingSegment(event);
            console.log("HERE TOO", $scope.selectedSegment);
            if ($scope.passedTest == true) {
              console.log("PASSED TEST");
              console.log($scope.selectedSegment);
              $scope.updateSegment();
            } else {
              console.log("LOSER");
            }
          },
          eventReceive: function (event) {
            //alert(JSON.stringify(event, null, 4));
            console.log("SEGEMENT eventReceive");
            event.end = moment(event.start).add(1, "days");
            for (var i = 0; i < $scope.departures.length; i++) {
              console.log($scope.departures[i].Id);
              if ($scope.departures[i].Id) {
                console.log("if ", $scope.departures[i].Id);
                $scope.newSegment.Departure__c = $scope.departures[i].Id;
              } else {
                console.log("else ");
              }
            }
            $scope.newSegment.Segment_Name__c = event.title;
            $scope.newSegment.StartDate__c = moment
              .utc(event.start)
              .format("x");
            $scope.newSegment.EndDate__c = moment.utc(event.end).format("x");
            $scope.createSegment();

            console.log("THIS IS A NEW SEGMENT: ", $scope.newSegment);
          },
          height: 300,
          ignoreTimezone: true,
          timeFormat: "H(:mm)",
          timezone: "UTC",
          titleFormat: "ddd M/D",
          eventRender: function (event, element) {
            element.find(".fc-title").html(event.title);
          },
          columnHeaderFormat: "ddd M/D",
          views: {
            basic: {
              // name of view
              titleFormat: "ddd M/D",
              columnFormat: "ddd M/D",
              dayCount: moment($scope.departureEndDate)
                .add(1, "days")
                .diff($scope.departureStartDate, "days"),
            },
          },
          slotWidth: 150,
          weekends: true,
        });
      };

      //-----------------------------------

      //---------------------BEGIN 2nd CAL INIT - DESTINATIONS
      // initialize FullCalendar js{
      $scope.initFullCalendarTwo = function () {
        //var calendarEndDate = $scope.getCalendarsEndDate();
        $("div#calendarTwo").fullCalendar({
          dayClick: function (date) {
            $scope.selectedDay = moment(date).format("L");
          },
          defaultView: "basic",
          defaultDate: $scope.departureStartDate,
          visibleRange: {
            start: $scope.departureStartDate,
            //end: $scope.departureEndDate
            //end: calendarEndDate
            end: moment($scope.departureEndDate).add(1, "days"),
          },
          header: {
            left: "",
            center: "title",
            right: "",
          },
          editable: true,
          eventClick: function (calEvent, jsEvent, view) {
            $scope.isDestinationFromMap = false;
            $scope.selectedDest = calEvent;
            $scope.getDestinationsMod(
              calEvent.destid,
              calEvent.start,
              calEvent.Segment
            );
            $("#destination-modal").modal("show");
          },
          eventStartEditable: true,
          eventDurationEditable: true,
          displayEventTime: false,
          contentHeight: "auto",
          droppable: true,
          drop: function () {
            if ($scope.destinations == null) {
              $(this).remove();
            }
          },
          eventResize: function (event, jsEvent, view) {
            console.log(event);
            console.log($scope.departures);
            $scope.isDestination = true;
            //console.log(event.id); undefined
            $("#Delete").remove();

            //get number of days between start date and new event end date
            var s = moment(event.start);
            var e = moment(event.end);
            var duration = moment.duration(e.diff(s));
            var days = duration.asDays();

            //Create 1 new dest assn
            if (days == 2) {
              $scope.newDest.Destination__c = event.destid;
              $scope.newDest.Segment__c = event.SegmentId;
              $scope.newDay.Date__c = moment
                .utc(event.end)
                .subtract(1, "days")
                .format("x");
              $scope.newDay.Segment__c = event.SegmentId;
              $scope.newDay.DepartureId__c = APP_DESIGN_STUDIO.departureId; //JCD - 2019-02-12 - Added this line.

              //$scope.dayDate: need date in 'l' format to run query of existing days
              $scope.dayDate = moment(event.end)
                .subtract(1, "days")
                .format("l");

              //TODO $scope.holdDay: storing this date if needed to create new day. This may be redundant. $scope.newDay.Date__c likely would work as well and could be used instead and remove holdDay. Need to Test.
              $scope.holdDay.Day = moment(event.end).subtract(1, "days");

              //$scope.isDestination = true;
              $scope.existingDest = false;
              $scope.getAllDays($scope.dayDate, event.SegmentId);
              return;
            } else if (days >= 3) {
              alert(
                "You have added more than 1 day to a destination. Please add one day at a time."
              );
              $scope.refreshCal();
              return;
            } else if (days >= 4) {
              alert("Please try again.");
              $scope.refreshCal();
            }
            //$scope.createDay();
          },
          eventDrop: function (event, delta, revertFunc) {
            console.log("DESTINATION eventDrop");
            $scope.selectedDest.Id = event.id;
            var tempDate = moment.utc(event.start).format("x");
            $scope.dayDate = moment(event.start).format("l");
            console.log(event);
            console.log($scope.selectedDest);
            console.log($scope.dayDate);
            $scope.isDestination = true;
            $scope.existingDest = true;
            console.log("$scope.dayDate = " + $scope.dayDate);
            console.log("event.SegmentId = " + event.SegmentId);
            $scope.getAllDays($scope.dayDate, event.SegmentId);
            return;
          },
          eventReceive: function (event) {
            //drag from destination sidebar to create new destinations

            //put destination event in variable to match destination to segment by date
            var eventStart = moment.utc(event.start).format("x");
            console.log(eventStart);
            event.end = moment(event.start).add(1, "days");
            console.log(event);

            //create new day for new destination ass
            $scope.newDay.Date__c = eventStart;
            $scope.newDay.DepartureId__c = APP_DESIGN_STUDIO.departureId; //JCD - 2019-02-12 - Added this line.
            $scope.holdDay.Day = moment(event.start);
            console.log($scope.holdDay);

            //add destination__c to $scope.newDest and $scope.newDay
            $scope.newDest.Destination__c = event.id;

            //add segment__c to $scope.newDest and $scope.newDay
            for (var i = 0; i < $scope.segments.length; i++) {
              if (
                eventStart >= $scope.segments[i].StartDate__c &&
                eventStart <= $scope.segments[i].EndDate__c
              ) {
                $scope.newDest.Segment__c = $scope.segments[i].id;
                $scope.newDay.Segment__c = $scope.segments[i].id;
              }
            }
            $scope.createDay();
          },
          height: 300,
          ignoreTimezone: true,
          timeFormat: "H(:mm)",
          timezone: "UTC",
          titleFormat: "ddd M/D",
          eventRender: function (event, element) {
            element.find(".fc-title").html(event.title);
            if (event.verificationstatus === "Not Approved") {
              element.css("background-color", "#ea001e");
            } else if (event.verificationstatus === "Audit Required") {
              element.css("background-color", "#36a0fe");
            }
          },
          columnHeaderFormat: "ddd M/D",
          views: {
            basic: {
              // name of view
              titleFormat: "ddd M/D",
              columnFormat: "ddd M/D",
              dayCount: moment($scope.departureEndDate)
                .add(1, "days")
                .diff($scope.departureStartDate, "days"),
            },
          },
          slotWidth: 150,
          weekends: true,
        });
      };

      //-----------------------------------

      //---------------------BEGIN 3rd CAL INIT --RESERVATIONS
      // initialize FullCalendar js{
      $scope.initFullCalendarThree = function () {
        //var calendarEndDate = $scope.getCalendarsEndDate();
        $("div#calendarThree").fullCalendar({
          dayClick: function (date) {
            $scope.selectedDay = moment(date).format("L");
          },
          defaultView: "basic",
          defaultDate: $scope.departureStartDate,
          visibleRange: {
            start: $scope.departureStartDate,
            end: moment($scope.departureEndDate).add(1, "days"),
          },
          header: {
            left: "",
            center: "title",
            right: "",
          },
          editable: true,
          eventStartEditable: true,
          eventDurationEditable: true,
          displayEventTime: false,
          contentHeight: "auto",
          eventClick: function (event, jsEvent, view) {
            $scope.getReservationMod(event.id);
            $("#modal-update-res").modal("show");
            return false;
          },
          eventResize: function (event, jsEvent, view) {
            console.log(event);
            $scope.selectedRes.EndDate__c = moment
              .utc(event.end)
              .add(-1, "days")
              .format("x");
            $scope.selectedRes.StartDate__c = moment
              .utc(event.start)
              .format("x");
            if (!$scope.selectedRes.Id) {
              console.log("selected reservation HAS NO NAME i mean ID!");
              $scope.selectedRes.Id = event.id;
            } else {
              console.log("SELECTED RES ID ", $scope.selectedRes.Id);
            }
            $scope.updateRes();
          },

          eventDrop: function (event, delta, revertFunc) {
            console.log(event);
            $scope.selectedRes.Id = event.id;
            $scope.selectedRes.StartDate__c = moment
              .utc(event.start)
              .format("x");
            //if event has no end date set 1 day, else use event end
            if (event.end == null) {
              $scope.selectedRes.EndDate__c = moment
                .utc(event.start)
                .add(1, "days")
                .format("x");
            } else {
              $scope.selectedRes.EndDate__c = moment
                .utc(event.end)
                .add(-1, "days")
                .format("x");
            }
            //set segment based on date
            var eventStart = moment.utc(event.start).format("x");
            for (var i = 0; i < $scope.segments.length; i++) {
              if (
                eventStart >= $scope.segments[i].StartDate__c &&
                eventStart <= $scope.segments[i].EndDate__c
              ) {
                $scope.selectedRes.Segment__c = $scope.segments[i].id;
              }
            }
            console.log($scope.selectedRes);
            $scope.updateRes();
          },

          height: 300,
          ignoreTimezone: true,
          timeFormat: "H(:mm)",
          timezone: "UTC",
          titleFormat: "ddd M/D",
          eventRender: function (event, element) {
            element.find(".fc-title").html(event.title);
          },
          columnHeaderFormat: "ddd M/D",
          views: {
            basic: {
              // name of view
              titleFormat: "ddd M/D",
              columnFormat: "ddd M/D",
              dayCount: moment($scope.departureEndDate)
                .add(1, "days")
                .diff($scope.departureStartDate, "days"),
            },
          },
          slotWidth: 150,
          weekends: true,
        });
      };

      //-----------------------------------
      //---------------------BEGIN 4th CAL INIT - LODGING

      // initialize FullCalendar js{
      $scope.initFullCalendarFour = function () {
        //var calendarEndDate = $scope.getCalendarsEndDate();
        $("div#calendarFour").fullCalendar({
          dayClick: function (date) {
            $scope.selectedDay = moment(date).format("L");
          },
          defaultView: "basic",
          defaultDate: $scope.departureStartDate,
          visibleRange: {
            start: $scope.departureStartDate,
            end: moment($scope.departureEndDate).add(1, "days"),
          },
          header: {
            left: "",
            center: "title",
            right: "",
          },
          editable: true,

          eventClick: function (event, jsEvent, view) {
            $scope.getReservationMod(event.id);
            $("#modal-update-res").modal("show");
            return false;
          },
          eventStartEditable: true,
          eventDurationEditable: true,
          displayEventTime: false,
          contentHeight: "auto",
          eventResize: function (event, jsEvent, view) {
            console.log(event);
            $scope.selectedRes.EndDate__c = moment
              .utc(event.end)
              .add(-1, "days")
              .format("x");
            $scope.selectedRes.StartDate__c = moment
              .utc(event.start)
              .format("x");
            if (!$scope.selectedRes.Id) {
              $scope.selectedRes.Id = event.id;
            } else {
              console.log("SELECTED RES ID ", $scope.selectedRes.Id);
            }

            $scope.updateRes();
          },
          eventDrop: function (event, delta, revertFunc) {
            console.log(event);
            $scope.selectedRes.Id = event.id;
            $scope.selectedRes.StartDate__c = moment
              .utc(event.start)
              .format("x");
            //if event has no end date set 1 day, else use event end
            if (event.end == null) {
              $scope.selectedRes.EndDate__c = moment
                .utc(event.start)
                .add(1, "days")
                .format("x");
            } else {
              $scope.selectedRes.EndDate__c = moment
                .utc(event.end)
                .add(-1, "days")
                .format("x");
            }
            //set segment based on date
            var eventStart = moment.utc(event.start).format("x");
            for (var i = 0; i < $scope.segments.length; i++) {
              if (
                eventStart >= $scope.segments[i].StartDate__c &&
                eventStart <= $scope.segments[i].EndDate__c
              ) {
                $scope.selectedRes.Segment__c = $scope.segments[i].id;
              }
            }
            console.log($scope.selectedRes);
            $scope.updateRes();
          },
          height: 300,
          ignoreTimezone: true,
          timeFormat: "H(:mm)",
          timezone: "UTC",
          titleFormat: "ddd M/D",
          eventRender: function (event, element) {
            element.find(".fc-title").html(event.title);
          },
          columnHeaderFormat: "ddd M/D",
          views: {
            basic: {
              // name of view
              titleFormat: "ddd M/D",
              columnFormat: "ddd M/D",
              dayCount: moment($scope.departureEndDate)
                .add(1, "days")
                .diff($scope.departureStartDate, "days"),
            },
          },
          slotWidth: 150,
          weekends: true,
        });
      };

      //-----------------------------------

      //---------------------BEGIN 5th CAL INIT - ROUTES
      // initialize FullCalendar js{
      $scope.initFullCalendarFive = function () {
        //var calendarEndDate = $scope.getCalendarsEndDate();
        $("div#calendarFive").fullCalendar({
          dayClick: function (date) {
            $scope.selectedDay = moment(date).format("L");
          },
          defaultView: "basic",
          defaultDate: $scope.departureStartDate,
          visibleRange: {
            start: $scope.departureStartDate,
            end: moment($scope.departureEndDate).add(1, "days"),
          },
          header: {
            left: "",
            center: "title",
            right: "",
          },
          editable: true,

          eventClick: function (calEvent, jsEvent, view) {
            // console.log(calEvent.url);
            // if (!/^(http:|https:)/i.test(calEvent.url)) {
            //     calEvent.url = "http://" + calEvent.url;
            // }
            // if (calEvent.url) {
            //     console.log(calEvent.url);
            //     window.open(calEvent.url, "_blank");
            //     return false;
            // }
            $scope.getRouteMod(calEvent.Id);
            $("#modal-route").modal("show");
            return false;
          },
          eventStartEditable: true,
          eventDurationEditable: true,
          displayEventTime: false,
          contentHeight: "auto",
          droppable: true,
          drop: function () {
            if ($scope.destinations == null) {
              $(this).remove();
            }
          },

          eventDrop: function (event, delta, revertFunc) {
            console.log(event);
            $scope.isRoute = true;
            $scope.existingRoute = true;
            //this is the day record Id of old
            $scope.selectedRoute.Id = event.Id;
            //remove route__c field data from old day
            $scope.selectedRoute.Route__c = "";

            //keep Route__c Id for new route assignment
            $scope.newRoute.Route__c = event.RouteId;
            $scope.dayDate = moment(event.start).format("l");

            //console.log($scope.segmentDays);
            //console.log($scope.selectedDay);
            // for(var i=0; i<$scope.segmentDays.length; i++) {
            //     if($scope.segmentDays[i].id===event.Id) {
            //         $scope.selectedDay.Date__c = moment.utc(event.start).format('x');
            //     }
            // }

            console.log("SELECTED DAY TO UPDATE ROUTE__c FIELD ");
            console.log($scope.selectedRoute);
            console.log($scope.dayDate);
            console.log($scope.newRoute);
            var routeStart = moment.utc($scope.dayDate).format("x");
            var routeSegment = "";
            var segmentMatch = false;
            console.log("START ", routeStart);

            //Make sure route is inside a segment
            for (var i = 0; i < $scope.segments.length; i++) {
              if (
                routeStart >= $scope.segments[i].StartDate__c &&
                routeStart <= $scope.segments[i].EndDate__c
              ) {
                console.log("route is in segment ", $scope.segments[i]);
                //routeSegment = $scope.segments[i].id;
                segmentMatch = true;
              }
            }
            console.log(segmentMatch);

            if (!segmentMatch) {
              alert(
                "Please ensure there is a segment on this day to create or move a record"
              );
              return;
            }
            //Don't need to check days using getAllDays here because if there's an existing route it has to be assigned to a day so there's an existing day.
            $scope.getAllDays($scope.dayDate, event.segment);
            //$scope.createOrUpdate();
            //$scope.createOrUpdateRoute();
          },
          height: 300,
          ignoreTimezone: true,
          timeFormat: "H(:mm)",
          timezone: "UTC",
          titleFormat: "ddd M/D",
          eventRender: function (event, element) {
            element.find(".fc-title").html(event.title);
            if (event.verificationstatus === "Not Approved") {
              element.css("background-color", "#ea001e");
            } else if (event.verificationstatus === "Audit Required") {
              element.css("background-color", "#36a0fe");
            }
          },
          columnHeaderFormat: "ddd M/D",
          views: {
            basic: {
              // name of view
              titleFormat: "ddd M/D",
              columnFormat: "ddd M/D",
              dayCount: moment($scope.departureEndDate)
                .add(1, "days")
                .diff($scope.departureStartDate, "days"),
            },
          },
          slotWidth: 150,
          weekends: true,
        });
      };

      //---------------------------------
      //---------------------END CAL INIT

      $scope.toSalesforceDate = function (date) {
        var _date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0
        );
        return _date;
      };

      //-----------------------------------
      //--------------------- BEGIN CREATE/UPDATE SEGMENT

      $scope.createSegment = function () {
        //send new segment for insert
        console.log("new segment", $scope.newSegment);
        $("#myPage").addClass("reloading");
        designStudio.createSegment(
          $scope.newSegment,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
              //alert('Selection must be between the start and end dates of the departure.');
              console.log("new segment", $scope.newSegment);
            } else if (event.status) {
              $scope.segments = [];
              $("#destination-modal").modal("hide");
              console.log("new segment", $scope.newSegment);
              $scope.refreshCal();
            } else {
              showAlert("Segment not created");
              console.log("new segment", $scope.newSegment);
              $scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // SEGMENT UPDATE
      $scope.updateModSegment = function () {
        if (!$scope.selectedSegment.EndDate__c)
          $scope.selectedSegment.EndDate__c =
            $scope.selectedSegment.StartDate__c;

        if ($scope.selectedSegment.EndDate__c != null) {
          $scope.selectedSegment.EndDate__c = moment
            .utc($scope.selectedSegment.EndDate__c)
            .format("x");
        }
        if ($scope.selectedSegment.StartDate__c != null) {
          $scope.selectedSegment.StartDate__c = moment
            .utc($scope.selectedSegment.StartDate__c)
            .format("x");
        }

        $scope.updateSegment();

        var tmp = $("div#calendar").fullCalendar("option", "end");
      };

      $scope.updateSegment = function () {
        if (!$scope.validateReservationDates()) {
          // clear field values
          return;
        }
        var reservations = $scope.assignReservationDatesAndClean(
          $scope.segmentModalReservations
        );

        if (!$scope.validateDestinationDates()) {
          // clear field values
          return;
        }
        var destinations = $scope.assignDestinationDatesAndClean(
          $scope.segmentModalDestinations
        );

        $scope.selectedSegment.Departure__c = APP_DESIGN_STUDIO.departureId;

        console.log("segment", $scope.selectedSegment);
        console.log("destinations", destinations);
        console.log("reservations", reservations);
        $("#myPage").addClass("reloading");
        designStudio.updateSegment(
          $scope.selectedSegment,
          reservations,
          destinations,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
              //$scope.selectedSegment = {};
              $scope.refreshCal();
            } else if (event.status) {
              $scope.refreshCal();
              $scope.selectedSegment = {};
              $("div#segment-modal").modal("hide");
            } else {
              showAlert(event.message);
              //$scope.selectedSegment = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.assignDestinationDatesAndClean = function (destinationsArray) {
        var destinations = [];
        if (!destinationsArray || destinationsArray.length == 0) return [];

        for (var j = 0; j < destinationsArray.length; j++) {
          if (!destinationsArray[j].start) continue;
          var destination = { Id: destinationsArray[j].destination.Id };
          destination.Date__c = moment
            .utc(destinationsArray[j].start)
            .format("x");
          destinations.push(destination);
        }

        return destinations;
      };

      $scope.assignReservationDatesAndClean = function (reservationsArray) {
        var reservations = [];
        if (!reservationsArray || reservationsArray.length == 0) return [];

        for (var j = 0; j < reservationsArray.length; j++) {
          if (!reservationsArray[j].start && !reservationsArray[j].end)
            continue;
          var reservation = { Id: reservationsArray[j].reservation.Id };
          if (reservationsArray[j].start)
            reservation.StartDate__c = moment
              .utc(reservationsArray[j].start)
              .format("x");
          if (reservationsArray[j].end)
            reservation.EndDate__c = moment
              .utc(reservationsArray[j].end)
              .format("x");
          reservations.push(reservation);
        }

        return reservations;
      };

      $scope.validateReservationDates = function () {
        if (
          !$scope.segmentModalReservations ||
          $scope.segmentModalReservations.length == 0
        )
          return true;
        var segmentStartDate = !$scope.selectedSegment.StartDate__c
          ? $scope.segmentModal[0].start
          : $scope.selectedSegment.StartDate__c;
        var segmentEndDate = !$scope.selectedSegment.EndDate__c
          ? $scope.segmentModal[0].end
          : $scope.selectedSegment.EndDate__c;
        var validDates = true;
        for (var j = 0; j < $scope.segmentModalReservations.length; j++) {
          if (
            !$scope.segmentModalReservations[j].start &&
            !$scope.segmentModalReservations[j].end
          )
            continue;
          var startDate;
          var endDate;
          if ($scope.segmentModalReservations[j].start != null)
            startDate = moment
              .utc($scope.segmentModalReservations[j].start)
              .format("x");
          if ($scope.segmentModalReservations[j].end != null)
            endDate = moment
              .utc($scope.segmentModalReservations[j].end)
              .format("x");

          if (
            (startDate && startDate < segmentStartDate) ||
            (endDate && endDate > segmentEndDate)
          ) {
            alert(
              "Reservation dates must be between start date and end date of segment. Please, check existing reservation dates."
            );
            validDates = false;
            break;
          }
        }
        return validDates;
      };

      $scope.validateDestinationDates = function () {
        if (
          !$scope.segmentModalDestinations ||
          $scope.segmentModalDestinations.length == 0
        )
          return true;
        var segmentStartDate = !$scope.selectedSegment.StartDate__c
          ? $scope.segmentModal[0].start
          : $scope.selectedSegment.StartDate__c;
        var segmentEndDate = !$scope.selectedSegment.EndDate__c
          ? $scope.segmentModal[0].end
          : $scope.selectedSegment.EndDate__c;
        var validDates = true;
        for (var j = 0; j < $scope.segmentModalDestinations.length; j++) {
          if (!$scope.segmentModalDestinations[j].start) continue;
          var startDate;
          if ($scope.segmentModalDestinations[j].start != null)
            startDate = moment
              .utc($scope.segmentModalDestinations[j].start)
              .format("x");
          if (
            startDate &&
            (startDate < segmentStartDate || startDate > segmentEndDate)
          ) {
            alert(
              "Destination dates must be between start date and end date of segment. Please, check existing destination dates."
            );
            validDates = false;
            break;
          }
        }
        return validDates;
      };

      // RESERVATION CLONE
      $scope.cloneModReservation = function () {
        if (confirm("Are you sure to clone this record?")) {
          $scope.cloneReservation();
        }
      };

      $scope.cloneReservation = function () {
        console.log($scope.selectedRes);
        $("#myPage").addClass("reloading");
        designStudio.cloneReservation(
          $scope.selectedRes.Id,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.selectedRes = {};
              $scope.refreshCal();
              $("div#modal-update-res").modal("hide");
            } else {
              !event.message
                ? showAlert("Record not deleted.")
                : showAlert(event.message);
              $scope.selectedRes = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // RESERVATION DELETE
      $scope.deleteModReservation = function () {
        if (confirm("Are you sure to delete this record?")) {
          $scope.deleteReservation();
        }
      };

      $scope.deleteReservation = function () {
        console.log($scope.selectedRes);
        $("#myPage").addClass("reloading");
        designStudio.deleteReservation(
          $scope.selectedRes.Id,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.selectedRes = {};
              $scope.refreshCal();
              $("div#modal-update-res").modal("hide");
            } else {
              !event.message
                ? showAlert("Record not deleted.")
                : showAlert(event.message);
              $scope.selectedRes = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.updateModDay = function () {
        console.log("SELECTED DAY PASSED FOR UPDATE ");
        console.log($scope.dayModal);

        console.log($scope.clickedDate);

        $("#myPage").addClass("reloading");
        designStudio.updateDay(
          $scope.clickedDate,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
              $scope.selectedSegment = {};
            } else if (event.status) {
              $scope.clickedDate = result;
              $scope.refreshCal();
              $scope.clickedDate = {};
              $("div#day-modal").modal("hide");
            } else {
              showAlert(event.message);
              $scope.selectedSegment = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //JCD - New method to delete modal segment.
      $scope.deleteModSegment = function () {
        if (confirm("Are you sure to delete this record?")) {
          $scope.deleteSegment($scope.selectedSegment);
        }
      };

      //JCD - New method to delete segment.
      $scope.deleteSegment = function () {
        console.log($scope.selectedSegment);
        $("#myPage").addClass("reloading");
        designStudio.deleteSegment(
          $scope.selectedSegment.Id,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.selectedSegment = {};
              $scope.selectedSegment.EndDate__c = "";
              $scope.selectedSegment.StartDate__c = "";
              $scope.refreshCal();
              $("div#segment-modal").modal("hide");
            } else {
              !event.message
                ? showAlert("Record not deleted.")
                : showAlert(event.message);
              $scope.selectedSegment = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.deleteModDestAss = function () {
        if (confirm("Are you sure to delete this record?")) {
          $scope.deleteDestAssn($scope.selectedDest);
        }
      };

      $scope.deleteDestAssn = function () {
        $("#myPage").addClass("reloading");
        designStudio.deleteDestAssn(
          $scope.selectedDest.id,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.selectedDest = {};
              $scope.refreshCal();
              $("div#destination-modal").modal("hide");
            } else {
              !event.message
                ? showAlert("Record not deleted.")
                : showAlert(event.message);
              $scope.selectedDest = {};
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.updateModDestAss = function () {
        var destination = $scope.destinationModal[0];
        if (!destination.dateToChange) {
          alert("Nothing to save");
          return;
        }

        var selectedSegmentId = $scope.selectedDest.SegmentId;
        if ($scope.destinationSeg.id) {
          selectedSegmentId = $scope.destinationSeg.id;
        }

        var date = moment.utc(destination.dateToChange).format("x");

        //Make sure is inside a segment
        var segmentId = null;
        for (var i = 0; i < $scope.segments.length; i++) {
          if (
            $scope.segments[i].id == selectedSegmentId &&
            date >= $scope.segments[i].StartDate__c &&
            date <= $scope.segments[i].EndDate__c
          ) {
            segmentId = $scope.segments[i].id;
          }
        }

        if (!segmentId) {
          alert(
            "The date is not within the dates of the segment. Please check the dates"
          );
          return;
        }

        $scope.isDestination = true;
        $scope.existingDest = true;
        $scope.selectedDest = { Id: $scope.selectedDest.id };
        $scope.getAllDays(
          moment.utc(destination.dateToChange).format("l"),
          segmentId
        );
      };

      //---------------------------------
      //---------------------END UPDATE SEGMENT

      //-----------------------------------
      //--------------------- BEGIN CREATE/UPDATE DEST ASSN/DAY

      $scope.createDay = function () {
        //send new segment for insert
        designStudio.createDay(
          $scope.newDay,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
              //alert('The date must be between the start and end dates of the segment.');
              $scope.refreshCal();
            } else if (event.status) {
              $scope.segmentDays = [];
              console.log("NEW DAY ", $scope.newDay);
              $scope.existingDay = true;
              //existingRoute might be redundant to existingDay
              $scope.existingRoute = true;
              console.log("EXISTING ROUTE IS: ", $scope.existingRoute);

              //get newly created day to add to new Destination
              designStudio.getDays(
                $scope.newDay.Segment__c,
                function (result, event) {
                  console.log(result);
                  if (event.type === "exception") {
                    showAlert(event.message);
                  } else if (event.status) {
                    //UPDATE OR CREATE DESTINATION
                    for (var i = 0; i < result.length; i++) {
                      var resultDay = moment(result[i].Date__c)
                        .add(1, "days")
                        .format("L");

                      if ($scope.tripStartDate == resultDay) {
                        console.log("hold day = result date");
                        if ($scope.existingDest == true) {
                          $scope.selectedDest.Day__c = result[i].Id;
                          console.log("existing destination is true");
                        } else {
                          $scope.newDest.Day__c = result[i].Id;
                          //Set setgment for new destination. An existing destination cannot move outside existing sement
                          console.log("existing destination is NOT true");
                          $scope.newDest.Segment__c = $scope.newDay.Segment__c;
                        }

                        console.log("are we even real?");
                        console.log("HOLDY DAY", $scope.holdDay);
                        console.log("IF NEW DEST ", $scope.newDest);
                        console.log("IF SELECTED DEST ", $scope.selectedDest);
                      }
                    }

                    $scope.createOrUpdate();
                  } else {
                    showAlert("Day not created");
                  }
                },
                { buffer: false, escape: true }
              );
            } else {
              showAlert("Segment not created");
              $scope.refreshCal();
              alert("Segment not created");
            }
          },
          { buffer: false, escape: true }
        );
      };

      // CALENDAR REFRESH
      $scope.refreshCal = function () {
        setTimeout(function () {
          $scope.segmentDays = [];
          $scope.segments = [];
          $scope.segmentDest = [];
          $scope.segmentLodgingRes = [];
          $scope.segmentRes = [];
          $scope.expArr = [];
          $scope.allRoutes = [];
          $scope.dayRoute = [];

          //setTimeout(function(){
          $scope.getSegmentDestinations();
          $scope.getDepartures();
          $scope.getDepartureReservations();
          $scope.getRouteDays();
          $scope.getRoutes();
          //$scope.getExperiences();
          //}, 300);
        }, 300);
      };

      $scope.createDest = function () {
        //send new segment for insert
        console.log("$scope.newDest ", $scope.newDest);
        $("#myPage").addClass("reloading");
        designStudio.createDest(
          $scope.newDest,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.refreshCal();
              $("div#destination-modal").modal("hide");
            } else {
              showAlert("Segment not created");
              $scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.createDestAssignments = function (
        startDate,
        endDate,
        destinationId,
        segmentId
      ) {
        //send new segment for insert

        $("#myPage").addClass("reloading");
        designStudio.createDestinationAssignments(
          startDate,
          endDate,
          APP_DESIGN_STUDIO.departureId,
          destinationId,
          segmentId,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.refreshCal();
              $("div#destination-modal").modal("hide");
            } else {
              showAlert("Segment not created");
              $scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.createDestAss = function () {
        if (!$scope.tripStartDate) {
          alert("You must select a date");
          return;
        }

        console.log("CREATE DESTINATION PASSED DATE:");
        console.log($scope.tripStartDate);

        var startDate = moment
          .utc($scope.tripStartDate, "MM/DD/YYYY")
          .format("x"); // jcdj - 05/03/2019 - triying to override js console error.
        var endDate = moment.utc($scope.tripEndDate, "MM/DD/YYYY").format("x");

        //Make sure is inside a segment
        var segmentId = null;
        for (var i = 0; i < $scope.segments.length; i++) {
          if (
            $scope.segments[i].id == $scope.destinationSeg.id &&
            startDate >= $scope.segments[i].StartDate__c &&
            endDate <= $scope.segments[i].EndDate__c
          ) {
            segmentId = $scope.segments[i].id;
          }
        }

        if (!segmentId) {
          alert(
            "The date is not within the dates of the selected segment. Please check the dates"
          );
          return;
        }

        $.each($scope.destinationModal, function (i) {
          $scope.newDest.Destination__c = $scope.destinationModal[i].Id;
        });
        $scope.newDest.Segment__c = $scope.destinationSeg.id;

        if (!$scope.newDest.Segment__c) {
          alert("A segment selection is required to add a destination.");
        } else {
          $scope.createDestAssignments(
            $scope.tripStartDate,
            $scope.tripEndDate,
            $scope.newDest.Destination__c,
            $scope.newDest.Segment__c
          );
          //$scope.getAllDays($scope.tripStartDate, $scope.newDest.Segment__c);
        }
      };

      $scope.createSegmentAss = function () {
        if (!$scope.tripStartDate) {
          alert("You must select a date");
          return;
        }

        if (!$scope.tripEndDate) $scope.tripEndDate = $scope.tripStartDate;
        //called from map destination modal to add to calendar in segment sectiontripStartDate
        $scope.newSegment.StartDate__c = moment
          .utc($scope.tripStartDate)
          .format("x");
        $scope.newSegment.EndDate__c = moment
          .utc($scope.tripEndDate)
          .format("x");
        $scope.newSegment.Departure__c = APP_DESIGN_STUDIO.departureId;
        $scope.newSegment.PrimaryDestinationId__c =
          $scope.destinationModal[0].Id;

        $.each($scope.destinationModal, function (i) {
          $scope.newSegment.Segment_Name__c = $scope.destinationModal[i].name;
        });

        console.log($scope.destinationModal);
        console.log($scope.newSegment);

        $scope.createSegment();
      };

      $scope.updateDest = function () {
        //send updated segment for update
        $("#myPage").addClass("reloading");
        designStudio.updateDest(
          $scope.selectedDest,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
              $scope.refreshCal();
            } else if (event.status) {
              $scope.selectedDest = result;
              $scope.refreshCal();
              $("div#destination-modal").modal("hide");
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //---------------------------------
      //---------------------END UPDATE DEST

      //--------------------------------
      //---------------------CREATE/UPDATE RES

      $scope.createReservation = function () {
        if (!$scope.tripEndDate) $scope.tripEndDate = $scope.tripStartDate;
        var resStart = moment.utc($scope.tripStartDate).format("x");
        var resEnd = moment.utc($scope.tripEndDate).format("x");
        if (resStart > resEnd) {
          alert("Reservation start date must be less than the end date.");
          return;
        }
        if (!$scope.vendorExp.key) {
          alert("You must select an expirience");
          return;
        }
        console.log("RESERVATION START " + resStart);
        console.log("RESERVATION END " + resEnd);

        console.log($scope.vendorExp);

        $scope.newRes.StartDate__c = resStart;
        $scope.newRes.EndDate__c = resEnd;
        $scope.newRes.Departure__c = APP_DESIGN_STUDIO.departureId;
        $scope.newRes.Experience__c = $scope.vendorExp.key;
        $scope.newRes.Segment__c = $scope.reservationSeg.id;
        console.log($scope.newRes);

        //check reservation dates against selected segment
        var validReservationDates = false;
        for (var i = 0; i < $scope.segments.length; i++) {
          if (
            $scope.segments[i].id == $scope.reservationSeg.id &&
            resStart >= $scope.segments[i].StartDate__c &&
            resEnd <= $scope.segments[i].EndDate__c
          ) {
            validReservationDates = true;
            //console.log('validReservationDates = ' + validReservationDates);
            break;
          }
        }
        if (!validReservationDates) {
          alert(
            "Dates must be between the beginning and end of selected segment. Please review the dates."
          );
          return;
        }
        $("#myPage").addClass("reloading");
        //send new reservation for insert
        designStudio.createReservation(
          $scope.newRes,
          $scope.vendorExp.type,
          function (result, event) {
            //console.log($scope.newRes);
            //console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
              //alert('Reservation not created');
              return;
            } else if (event.status) {
              $scope.tripStartDate = "";
              $scope.tripEndDate = "";
              setTimeout(function () {
                $("#modal-create-res").modal("hide");
                $scope.refreshCal();
              }, 300);
            } else {
              alert("Reservation not created");
              return;
              //$scope.refreshCal();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // RESERVATION MODAL UPDATE
      $scope.updateModReservation = function () {
        var reservationSegmentId = $scope.selectedRes.Segment__c
          ? $scope.selectedRes.Segment__c
          : $scope.reservationModal[0].Segment__c;
        console.log("reservationSegmentId", reservationSegmentId);
        var segStartDate;
        var segEndDate;
        for (var i = 0; i < $scope.segments.length; i++) {
          if (reservationSegmentId == $scope.segments[i].id) {
            segStartDate = $scope.segments[i].StartDate__c;
            segEndDate = $scope.segments[i].EndDate__c;
            if (!segEndDate) segEndDate = segStartDate;
            break;
          }
        }
        console.log("segStartDate", segStartDate);
        console.log("segEndDate", segEndDate);
        var resStartDate = $scope.selectedRes.StartDate__c
          ? moment.utc($scope.selectedRes.StartDate__c).format("x")
          : $scope.reservationModal[0].StartDate__c;
        console.log("resStartDate", resStartDate);
        var resEndDate = $scope.selectedRes.EndDate__c
          ? moment.utc($scope.selectedRes.EndDate__c).format("x")
          : $scope.reservationModal[0].EndDate__c;
        console.log("resEndDate", resEndDate);
        if (resEndDate < resStartDate) {
          alert(
            "Reservation start date must be lower that or equal to reservation end date."
          );
          return;
        }
        if (resStartDate < segStartDate || resEndDate > segEndDate) {
          alert("Reservation dates must be between segment dates.");
          return;
        }
        $scope.updateRes();
      };

      // RESERVATION UPDATE
      $scope.updateRes = function () {
        //send updated segment for update
        console.log("RECEIVED RESERVATION", $scope.selectedRes);
        if (
          $scope.selectedRes.StartDate__c &&
          $scope.selectedRes.StartDate__c.indexOf("/") != -1
        )
          $scope.selectedRes.StartDate__c = moment
            .utc($scope.selectedRes.StartDate__c)
            .format("x");
        if (
          $scope.selectedRes.EndDate__c &&
          $scope.selectedRes.EndDate__c.indexOf("/") != -1
        )
          $scope.selectedRes.EndDate__c = moment
            .utc($scope.selectedRes.EndDate__c)
            .format("x");
        var reservation = {};
        reservation.Id = $scope.selectedRes.Id;
        if ($scope.selectedRes.StartDate__c)
          reservation.StartDate__c = $scope.selectedRes.StartDate__c;
        if ($scope.selectedRes.EndDate__c)
          reservation.EndDate__c = $scope.selectedRes.EndDate__c;
        $("#myPage").addClass("reloading");
        designStudio.updateRes(
          reservation,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
              $scope.refreshCal();
            } else if (event.status) {
              //$scope.selectedRes = result;
              $scope.selectedRes = {};
              $("div#modal-update-res").modal("hide");
              $scope.refreshCal();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      //---------------------------------
      //---------------------END CREATE/UPDATE RES

      //---------------------------------
      //---------------------CREATE/ ROUTE
      $scope.addRoute = function () {
        $scope.routeDate = "";
        $("div#modal-get-routes").modal("show");
      };

      //CREATE/CONNECT DAY RELATIONSHIP RECORD FOR ROUTE (WHEN USING ADD ROUTE BUTTON "createOrUpdateRoute" is called first to get segment id)
      //JCD - 2019-02-12 - Added APP_DESIGN_STUDIO.departureId parameter to controller call.
      $scope.getAllDays = function (date, segment) {
        var day = date;
        var seg = segment;
        console.log(day, seg);
        $("#myPage").addClass("reloading");
        designStudio.getAllDays(
          day,
          APP_DESIGN_STUDIO.departureId,
          function (result, event) {
            if (result.length > 1) {
              alert(
                "There is more than one day using the same date in the same segment. Please review in Salesforce before proceeding."
              );
              $scope.refreshCal();
              //Update existing day with route__c
            } else if (result.length == 1) {
              console.log("there is one existing day that matches selection");
              console.log(result);
              $scope.allDays = result;
              $scope.existingDay = true;
              //set if day was not created as well. also set in createDay
              $scope.existingRoute = true;
              if ($scope.isDestination == true) {
                console.log("we are working with a destination");
                $.each(result, function (i) {
                  $scope.selectedDest.Day__c = result[i].Id;
                  $scope.selectedDest.Segment__c = seg;
                  $scope.newDest.Day__c = result[i].Id;
                });
                console.log($scope.selectedDest);
                //$scope.updateDest();
              }
              if ($scope.isRoute == true) {
                $.each(result, function (i) {
                  $scope.newRoute.Id = result[i].Id; // JCD: ¿assign Day__c.Id to newRoute.Id? ¿Is this right?
                });
                console.log("new route ", $scope.newRoute);
              }
              if ($scope.isDestinationFromMap == true) {
                $.each(result, function (i) {
                  $scope.newDest.Day__c = result[i].Id;
                });
              }
              $scope.createOrUpdate();
              $scope.$apply();
              $("i#fa-loader-get-user").hide();
            } else {
              $scope.existingDay = false;
              $scope.newDay.Date__c = moment.utc(day).format("x");
              $scope.newDay.Segment__c = seg;
              $scope.newDay.DepartureId__c = APP_DESIGN_STUDIO.departureId; //JCD - 2019-02-12 - Added this line.
              console.log($scope.newDay);
              $scope.createOrUpdate();
            }

            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //WHERE TO SEND
      $scope.createOrUpdate = function () {
        console.log(
          "DAY RECORD EXISTS FOR THIS DATE AND SEGMENT: ",
          $scope.existingDay
        );
        if ($scope.existingDay == false) {
          $scope.createDay();
          return;
        }
        if ($scope.isDestination == true || $scope.isDestinationFromMap) {
          // jcdj - 2019/05/03 - Added or clause to avoid destination record duplication.
          console.log("SELECTION IS A DESTINATION: ", $scope.isDestination);
          if ($scope.existingDest == true) {
            console.log(
              "DESTINATION ASSIGNMENT RECORD EXISTS: ",
              $scope.existingDest
            );
            $scope.updateDest();
          } else {
            $scope.createDest();
          }
        }
        if ($scope.isRoute == true) {
          console.log("SELECTION IS A ROUTE: ", $scope.isRoute);
          if ($scope.existingRoute == true) {
            console.log("ROUTE RECORD EXISTS: ", $scope.existingRoute);
            //update the relevant Day record with route info
            console.log($scope.selectedRoute);
            console.log($scope.newRoute);
            $scope.updateRouteOnDay();
          }
        }
        $scope.isDestination = false;
        $scope.isRoute = false;
        /*
            // jcdj - 2019/05/03 - commented
            if(($scope.isDestinationFromMap == true) && ($scope.existingDest == false)) {
                console.log('WE ARE ADDING A NEW DESTIN FROM MAP');
                $scope.createDest();
            }
            */
      };

      $scope.updateRouteOnDay = function () {
        console.log("this is the new route, ", $scope.newRoute);
        console.log("this is the old route ", $scope.selectedRoute);
        $("#myPage").addClass("reloading");
        designStudio.updateRouteOnDay(
          $scope.newRoute,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.newRoute = result;
              console.log(result);

              console.log($scope.selectedRoute);
              if ($scope.selectedRoute.Id == null) {
                console.log(
                  "only adding route to new day, no need to remove route from old day"
                );
                $scope.refreshCal();
                $("div#modal-get-routes").modal("hide");
                $("div#modal-route").modal("hide");
              } else {
                console.log($scope.selectedRoute);
                $scope.selectedRoute.Route__c = "";
                var json = angular.toJson($scope.selectedRoute);
                $scope.selectedRoute = angular.fromJson(json);
                console.log($scope.selectedRoute);
                designStudio.updateRouteOnDay(
                  $scope.selectedRoute,
                  function (result, event) {
                    if (event.type === "exception") {
                      showAlert(event.message);
                      $scope.refreshCal();
                      console.log("REFRESHING");
                    } else if (event.status) {
                      $scope.newRoute = result;
                      console.log(result);

                      $scope.refreshCal();
                      console.log("REFRESHING");
                      $("div#modal-get-routes").modal("hide");
                      $("div#modal-route").modal("hide");
                    } else {
                      showAlert(event.message);
                      $scope.refreshCal();
                      console.log("REFRESHING");
                    }
                  },
                  { buffer: false, escape: true }
                );
              }
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //CREATE OR UPDATE ROUTE FROM ADD ROUTE BUTTON
      $scope.createOrUpdateRoute = function () {
        $scope.isDestination = false;
        $scope.isDestinationFromMap = false;
        $scope.isRoute = true;
        $scope.newRoute.Route__c = $scope.buttonSelectedRoute.key;
        var routeStart = moment.utc($scope.routeDate).format("x");
        console.log(routeStart);
        var routeSegment = "";
        var segmentMatch = false;
        // console.log('START ', routeStart);
        for (var i = 0; i < $scope.segments.length; i++) {
          if (
            routeStart >= $scope.segments[i].StartDate__c &&
            routeStart <= $scope.segments[i].EndDate__c
          ) {
            console.log("route is in segment ", $scope.segments[i]);
            routeSegment = $scope.segments[i].id;
            segmentMatch = true;
          }
        }
        console.log(segmentMatch);
        if (!segmentMatch) {
          alert(
            "Please ensure there is a segment on this day to create or move a record."
          );
          return;
        } else {
          $scope.getAllDays($scope.routeDate, routeSegment);
        }
        console.log($scope.newRoute);
      };

      $scope.openNewRouteDialog = function () {
        $("#modal-new-route").modal("show");
      };

      //---------------------------------
      //---------------------END CREATE ROUTE

      //--------------------------------
      //---------------------BEGIN MAP DEV

      //set map location on launch

      //set map by entered region on trip
      //DISABLED PER CONVERSATION 10/31/2018 TO SET MAP AT STANDARD STATIC LOCATION

      $scope.getRegion = function () {
        $("#myPage").addClass("reloading");
        designStudio.getRegion(
          APP_DESIGN_STUDIO.tripId,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.setRegion = result;
              let region = $scope.setRegion.toString();

              console.log("$scope.setRegion = ", region);

              $scope.$apply();
              $("i#fa-loader-get-user").hide();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getRegion();

      //set map by google map search
      $scope.findDestination = function () {
        localStorage.setItem("enterDest", JSON.stringify($scope.enterDest));
        console.log("Destination ", $scope.enterDest);
        map.setZoom(13);
        geocoder = new google.maps.Geocoder();
        if (geocoder) {
          geocoder.geocode(
            {
              address: $scope.enterDest,
            },
            function (results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                  map.setCenter(results[0].geometry.location);
                } else {
                  alert("No results found");
                }
              } else {
                alert(
                  "Geocode was not successful for the following reason: " +
                    status
                );
              }
            }
          );
        }
      };

      //GET VENDOR INFO INCLUDING LAT LONG
      $scope.getAccountLatLong = function () {
        $("#myPage").addClass("reloading");
        designStudio.getAccountLatLong(
          function (result, event) {
            //console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              //console.log(result);
              $scope.vendorMarkers = result;
              console.log($scope.vendorMarkers);
              for (var i = 0; i < $scope.vendorMarkers.length; i++) {
                if (
                  $scope.vendorMarkers[i].RecordTypeId == "012d0000000WthgAAC"
                ) {
                  $scope.addMarkers($scope.vendorMarkers[i]);
                } else {
                  console.log("Not a vendor");
                }
              }
              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getAccountLatLong();

      //GET DESTINATIONS FOR MAP
      $scope.getDestinationsLatLong = function () {
        $("#myPage").addClass("reloading");
        designStudio.getDestinationsLatLong(
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.destinationMarkers = result;
              console.log($scope.destinationMarkers);
              for (var i = 0; i < $scope.destinationMarkers.length; i++) {
                $scope.addMarkers($scope.destinationMarkers[i]);
              }

              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getDestinationsLatLong();

      //GET VENDOR FOR MODAL
      $scope.getVendors = function (marker) {
        console.log(marker);
        $("#myPage").addClass("reloading");
        designStudio.getVendors(
          marker,
          function (result, event) {
            //console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              //console.log(result);
              $.each(result, function (i) {
                if (result[i].Summary_Description__c != null) {
                  result[i].Summary_Description__c = $scope.decodeHTML(
                    result[i].Summary_Description__c
                  );
                }
              });
              $scope.vendorModal = result;
              console.log($scope.vendorModal);

              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //GET DESTINATIONS FOR MODAL FROM CAL
      $scope.getDestinationsMod = function (
        calEventId,
        calEventDate,
        segmentName
      ) {
        $("#myPage").addClass("reloading");
        designStudio.getDestinationsMod(
          calEventId,
          function (result, event) {
            console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              var tempObj = [];
              $.each(result, function (i) {
                if (result[i].Background__c == null) {
                  result[i].Background__c = "Awaiting data";
                }
                if (result[i].Name == null) {
                  result[i].Name = "Awaiting data";
                }
                if (result[i].Things_to_See_and_Do__c == null) {
                  result[i].Things_to_See_and_Do__c = "Awaiting data";
                }
                if (result[i].Narrative__c == null) {
                  result[i].Narrative__c = "Awaiting data";
                }
                tempObj.push({
                  Id: result[i].Id,
                  back: $scope.decodeHTML(result[i].Background__c),
                  tack: result[i].Background__c,
                  things: $scope.decodeHTML(result[i].Things_to_See_and_Do__c),
                  name: decodeCharacters(result[i].Name),
                  narr: $scope.decodeHTML(result[i].Narrative__c),
                  date: calEventDate,
                  dateToChange: "",
                  segmentName: segmentName,
                });
              });
              console.log(tempObj);
              $scope.destinationModal = tempObj;
              console.log("$scope.destinationModal", $scope.destinationModal);
              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      //GET EXPERIENCES FOR MODAL
      $scope.getExperiences = function (marker) {
        console.log(marker);
        $scope.newRes.Vendor__c = marker;
        $("#myPage").addClass("reloading");
        designStudio.getExperiences(
          marker,
          function (result, event) {
            //console.log(result);
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              console.log(result);
              $.each(result, function (i) {
                $scope.expArr.push({
                  key: result[i].Id,
                  value: result[i].Experience_Name__c,
                  type: result[i].RecordType.Name,
                });
              });
              console.log($scope.vendorExp);
              console.log("EXPERIENCES");
              console.log($scope.expArr);

              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // GET SEGMENT FOR MODAL
      $scope.getSegmentMod = function (calEventId) {
        $("#myPage").addClass("reloading");
        designStudio.getSegmentMod(
          calEventId,
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              var tempSegments = [];
              var tempSegmentDestinations = [];
              var tempSegmentReservations = [];
              $.each(result, function (i) {
                if (result[i].Narrative__c == null) {
                  result[i].Narrative__c = "Awaiting data";
                }
                tempSegments.push({
                  Id: result[i].Id,
                  name: $scope.decodeHTML(result[i].Segment_Name__c), //JCD - Added this line
                  narr: $scope.decodeHTML(result[i].Narrative__c),
                  start: result[i].StartDate__c,
                  end: result[i].EndDate__c,
                });
                $scope.selectedSegment = {};
                $scope.selectedSegment.Id = result[i].Id;
                $.each(result[i].Destination_Assignments__r, function (j) {
                  if (
                    result[i].Destination_Assignments__r[j].Destination__c !=
                    result[i].PrimaryDestinationId__c
                  ) {
                    // filter out primary destinations
                    tempSegmentDestinations.push({
                      Id: result[i].Destination_Assignments__r[j].Id,
                      name: $scope.decodeHTML(
                        result[i].Destination_Assignments__r[j].Destination__r
                          .Name
                      ),
                      start: null,
                      end: null,
                      destination: result[i].Destination_Assignments__r[j],
                    });
                  }
                });
                $.each(result[i].Reservations__r, function (j) {
                  tempSegmentReservations.push({
                    Id: result[i].Reservations__r[j].Id,
                    vendor: $scope.decodeHTML(
                      result[i].Reservations__r[j].Vendor__r.Name
                    ),
                    experience: $scope.decodeHTML(
                      result[i].Reservations__r[j].Experience_Name__c
                    ),
                    start: null,
                    end: null,
                    reservation: result[i].Reservations__r[j],
                  });
                });
              });
              $scope.segmentModal = tempSegments;
              $scope.showSegmentReservationLabel =
                tempSegmentReservations.length > 0;
              $scope.segmentModalReservations = tempSegmentReservations;
              $scope.showSegmentDestinationLabel =
                tempSegmentDestinations.length > 0;
              $scope.segmentModalDestinations = tempSegmentDestinations;
              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // GET RESERVATION FOR MODAL
      $scope.getReservationMod = function (reservationId) {
        $("#myPage").addClass("reloading");
        designStudio.getReservationMod(
          reservationId,
          function (result, event) {
            if (event.type === "exception" || !event.status) {
              showAlert(event.message);
            } else if (event.status) {
              var tempReservationModal = [];
              $.each(result, function (i) {
                if (result[i].EndDate__c == null) {
                  result[i].EndDate__c = result[i].StartDate__c;
                }
                $scope.selectedRes.StartDate__c = null;
                $scope.selectedRes.EndDate__c = null;
                $scope.selectedRes.Id = result[i].Id;
                result[i].Title =
                  result[i].Vendor__r.Name +
                  " - " +
                  result[i].Experience_Name__c;
                tempReservationModal.push(result[i]);
              });
              $scope.reservationModal = tempReservationModal;
              console.log($scope.reservationModal);
              $scope.$apply();
              hideAlert();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // GET ROUTE FOR MODAL
      $scope.getRouteMod = function (routeId) {
        $("#myPage").addClass("reloading");
        designStudio.getRouteDay(
          routeId,
          function (result, event) {
            if (event.type === "exception" || !event.status) {
              showAlert(event.message);
            } else if (event.status) {
              var tempRouteModal = [];
              $.each(result, function (i) {
                tempRouteModal.push({
                  Id: result[i].Id,
                  Route__c: result[i].Route__c,
                  name: result[i].Route__r.Name,
                  date: result[i].Date__c,
                  Date__c: null,
                });
              });
              $scope.routeModal = tempRouteModal;
              console.log($scope.routeModal);
              $scope.$apply();
              hideAlert();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      // UPDATE ROUTE FROM MODAL
      $scope.updateModRouteDay = function () {
        var route = $scope.routeModal[0];
        if (!route.Date__c) return;
        var routeDate = moment.utc(route.Date__c).format("x");
        if (
          routeDate < $scope.departureStartDate ||
          routeDate > $scope.departureEndDate
        ) {
          alert(
            "The route day must be within the start and end date of the destination."
          );
          return;
        }

        $scope.updateRouteDay(route);
      };

      // CREATE NEW ROUTE
      $scope.createNewRoute = function () {
        if (!$scope.newRoute.Name) {
          alert("You must provide a route name");
          return;
        }

        if (!$scope.newRoute.Driving_Directions__c)
          $scope.newRoute.Driving_Directions__c = "";
        if (!$scope.newRoute.Last_Mile__c) $scope.newRoute.Last_Mile__c = "";
        if (!$scope.newRoute.Along_the_Way_Title__c)
          $scope.newRoute.Along_the_Way_Title__c = "";
        if (!$scope.newRoute.Along_The_Way__c)
          $scope.newRoute.Along_The_Way__c = "";

        $("#myPage").addClass("reloading");
        designStudio.createNewRoute(
          $scope.newRoute.Name,
          $scope.newRoute.Driving_Directions__c,
          $scope.newRoute.Last_Mile__c,
          $scope.newRoute.Along_the_Way_Title__c,
          $scope.newRoute.Along_The_Way__c,
          function (result, event) {
            if (event.type === "exception" || !event.status) {
              showAlert(event.message);
            } else if (event.status) {
              console.log(result);
              var route = {
                key: result.Id,
                value: result.Name,
              };
              $scope.allRoutes.push(route);
              $scope.buttonSelectedRoute = route;
              $scope.$apply();
              $("#modal-new-route").modal("hide");
            }
            $("#myPage").removeClass("reloading");
            $scope.newRoute = {};
          },
          { buffer: false, escape: true }
        );
      };

      // DELETE ROUTE FROM MODAL
      $scope.deleteModRouteDay = function () {
        if (confirm("Are you sure to delete this route?")) {
          var route = $scope.routeModal[0];
          $scope.deleteRoute(route.Id);
        }
      };

      $scope.deleteRoute = function (routeId) {
        $("#myPage").addClass("reloading");
        designStudio.deleteRoute(
          routeId,
          function (result, event) {
            if (event.type === "exception" || !event.status) {
              showAlert(event.message);
            } else if (event.status) {
              $scope.routeModal = [];
              $("div#modal-route").modal("hide");
              $scope.refreshCal();
              hideAlert();
            }
            $("#myPage").removeClass("reloading");
          },
          { buffer: false, escape: true }
        );
      };

      $scope.updateRouteDay = function (route) {
        $scope.isRoute = true;
        $scope.existingRoute = true;
        //this is the day record Id of old
        $scope.selectedRoute.Id = route.Id;
        //remove route__c field data from old day
        $scope.selectedRoute.Route__c = "";

        //keep Route__c Id for new route assignment
        $scope.newRoute.Route__c = route.Route__c;
        $scope.dayDate = moment.utc(route.Date__c).format("l");

        var routeStart = moment.utc($scope.dayDate).format("x");
        var routeSegment = "";
        var segmentMatch = false;

        //Make sure route is inside a segment
        for (var i = 0; i < $scope.segments.length; i++) {
          if (
            routeStart >= $scope.segments[i].StartDate__c &&
            routeStart <= $scope.segments[i].EndDate__c
          ) {
            routeSegment = $scope.segments[i];
            segmentMatch = true;
          }
        }

        if (!segmentMatch) {
          alert(
            "Please ensure there is a segment on this day to create or move a record."
          );
          return;
        }
        //Don't need to check days using getAllDays here because if there's an existing route it has to be assigned to a day so there's an existing day.
        $scope.getAllDays($scope.dayDate, routeSegment.id);
      };

      //GET DAY FOR MODAL
      $scope.getDayMod = function (date) {
        console.log(date);
        designStudio.getDayMod(
          APP_DESIGN_STUDIO.departureId,
          $scope.fetchClickedDate,
          function (result, event) {
            console.log(result);
            if (result === undefined || result.length == 0) {
              alert("There is no day record for this day");
              $("#day-modal").modal("hide");
            }
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.dayModal = result;
              $.each($scope.dayModal, function (i) {
                $scope.clickedDate = $scope.dayModal[i];
                $scope.clickedDate.Details_for_the_Day__c =
                  $scope.clickedDate.Details_for_the_Day__c.replace(
                    new RegExp("&amp;", "gi"),
                    "&"
                  )
                    .replace(new RegExp("&lt;", "gi"), "<")
                    .replace(new RegExp("&#60;", "gi"), "<")
                    .replace(new RegExp("&gt;", "gi"), ">")
                    .replace(new RegExp("&quot;", "gi"), '"');
              });

              $scope.$apply();
              hideAlert();
            } else {
              showAlert(event.message);
            }
          },
          { buffer: false, escape: true }
        );
      };

      $scope.markerButton = function () {
        console.log("ANYTHING");
        console.log($scope.buttonSelectedDest);
        if ($scope.buttonSelectedDest.Geolocation__Longitude__s == null) {
          if (
            confirm(
              "There is no geolocation information for this destination. Would you like to add it now?"
            )
          ) {
            $scope.destinationForGelocation = $scope.buttonSelectedDest;
            $("#modal-geolocation").modal("show");
          }
        } else {
          var latLng = new google.maps.LatLng(
            $scope.buttonSelectedDest.Geolocation__Latitude__s,
            $scope.buttonSelectedDest.Geolocation__Longitude__s
          );
          map.panTo(latLng);
          map.setZoom(15);
        }
      };

      $scope.updateGeolocation = function () {
        if (
          !$scope.destinationForGelocation.Geolocation__Longitude__s ||
          !$scope.destinationForGelocation.Geolocation__Latitude__s
        ) {
          alert("You need to specify a Latitude and Longitude");
          return;
        }

        designStudio.saveGeolocation(
          $scope.destinationForGelocation.Id,
          $scope.destinationForGelocation.Geolocation__Longitude__s,
          $scope.destinationForGelocation.Geolocation__Latitude__s,
          function (result, event) {
            console.log(result);
            if (result === undefined || result.length == 0) {
              alert("Could not update the geolocation on thd destination");
            }
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.addMarkers($scope.destinationForGelocation);
              $scope.markerButton();
              $("#modal-geolocation").modal("hide");
              $scope.destinationForGelocation = {};
            } else {
              showAlert(event.message);
            }
          },
          { buffer: false, escape: true }
        );
      };

      $scope.resetMapButton = function () {
        var center = new google.maps.LatLng(42.0568922, -110.1406513);
        map.setZoom(5);
        map.panTo(center);
      };

      $scope.addMarkers = function (marker) {
        var what = marker;
        var something = "";
        var splitCat = "";
        var unsplitCat = "";
        marker.Name = $scope.decodeHTML(marker.Name);
        if (marker.Vendor_Type__c == null) {
          something = "Destination - Test";
          //console.log(something);
        } else {
          something = marker.Vendor_Type__c;
          console.log(something);
        }

        //add markers to map
        $scope.allMarkers.push(marker);
        //console.log(marker);
        //console.log('ALL MARKERS ', $scope.allMarkers);

        unsplitCat = something.toString().split(" - ");
        //console.log(unsplitCat);
        splitCat = unsplitCat[0];
        //console.log(splitCat);
        var category = splitCat;
        //console.log(category);

        var title = marker.Name;
        var id = marker.Id;
        var pos = new google.maps.LatLng(
          marker.Geolocation__Latitude__s,
          marker.Geolocation__Longitude__s
        );
        var content = marker.Name + marker.Vendor_Type__c + marker.Phone;
        var marker2;
        marker2 = new google.maps.Marker({
          title: title,
          position: pos,
          category: category,
          map: map,
          id: id,
        });

        gmarkers2.push(marker2);

        // Marker click listener
        google.maps.event.addListener(marker2, "click", function () {
          $scope.isDestinationFromMap = true;
          console.log(marker2);
          $scope.refreshCal();
          //console.log($scope.vendorModal);
          $scope.getVendors(marker2.id);
          $scope.getDestinationsMod(marker2.id);
          $scope.tripStartDate = "";
          $scope.tripEndDate = "";
          setTimeout(function () {
            if (marker2.category == "Destination") {
              $scope.existingDest = false;
              $("#destination-modal").modal("show");
            } else {
              $("#modal-create-res").modal("show");
              $scope.getExperiences(marker2.id);
            }
          }, 300);
        });
      };
      $scope.initDatePicker = function () {
        var startDate = new Date($scope.departureStartDate);
        var endDate = new Date($scope.departureEndDate);
      };

      //--------------------------------
      //---------------------END MAP DEV

      //Account/Page Deets
      $scope.getUser = function () {
        $("i#fa-loader-get-user").show();
        designStudio.getUser(
          function (result, event) {
            if (event.type === "exception") {
              showAlert(event.message);
            } else if (event.status) {
              $scope.user = result;
              $scope.$apply();
              $("i#fa-loader-get-user").hide();
            } else {
              showAlert(event.message);
            }
          },
          { buffer: false, escape: true }
        );
      };
      $scope.getUser(); // immediately invoke
    },
  ]);

  // end AngularJS

  // jQuery
  $(".modal").on("show.bs.modal", function (e) {
    setTimeout(function () {
      $(".input-group.date.start")
        .datepicker()
        .on("changeDate", function (e) {
          var endId =
            "div#" +
            e.currentTarget.id.replace("Start", "End") +
            ".input-group.date.end";
          $(endId).datepicker("setStartDate", e.date);
        });
    }, 1000);
  });

  var isAbsolute = true;
  $("a#back-to-top").on("click", function (event) {
    event.preventDefault();
    $("html, body").animate(
      {
        scrollTop: $("html").offset().top,
      },
      "slow"
    );
  });

  $("button#close-alert-error").on("click", function () {
    $("div#alert-error").fadeOut();
  });

  $("button#close-warning-error").on("click", function () {
    $("div#warning-error").fadeOut();
  });
  $(document).on("click", "div.event-parent-container", function () {
    $(this).next("div.event-children-container").stop().slideToggle();
    if (isAbsolute === true) {
      $("footer").css("position", "relative");
      $("footer").css("bottom", "0");
      $("footer").css("width", "100%");
      isAbsolute = false;
    } else if (isAbsolute === false) {
      $("footer").css("position", "absolute");
      $("footer").css("bottom", "0");
      $("footer").css("width", "100%");
      isAbsolute = true;
    }
  });

  $("#modal-route").draggable({ handle: ".modal-header" });
  $("#modal-get-routes").draggable({ handle: ".modal-header" });
  $("#day-modal").draggable({ handle: ".modal-header" });
  $("#modal-update-res").draggable({ handle: ".modal-header" });
  $("#destination-modal").draggable({ handle: ".modal-header" });
  $("#segment-modal").draggable({ handle: ".modal-header" });
  $("#modal-create-res").draggable({ handle: ".modal-header" });
  $("#create-dept").draggable({ handle: ".modal-header" });
  $("#modal-trip-dates").draggable({ handle: ".modal-header" });
  $("#modal-geolocation").draggable({ handle: ".modal-header" });
  $("#modal-new-route").draggable({ handle: ".modal-header" });
})(jQuery);
