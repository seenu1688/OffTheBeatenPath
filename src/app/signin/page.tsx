import { Button } from "@/components/button";

import { signIn } from "@/auth";

type Props = {
  searchParams: {
    redirect_uri: string;
  };
};

const SignInPage = ({ searchParams }: Props) => {
  const redirectUri = searchParams["redirect_uri"];

  return (
    <div className="flex h-full w-full items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signIn("salesforce", {
            redirectTo: redirectUri
              ? `${process.env.NEXT_PUBLIC_URL}${redirectUri}`
              : "/",
          });
        }}
      >
        <Button type="submit">SignIn With Salesforce</Button>
      </form>
    </div>
  );
};

export default SignInPage;
