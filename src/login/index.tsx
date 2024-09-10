import { Button, Card, Typography } from "antd";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import styled from "styled-components";
import { useStore } from "../store";

import google from "./logo-google.svg";
import microsoft from "./logo-microsoft.svg";

export default function LoginPage() {
  const store = useStore();
  useEffect(() => store.showApp(), [store]);
  const size = 18;

  return (
    <LoginPageWrapper>
      <Card>
        <LoginCardContent>
          <LoginTitle level={2}>Sign in</LoginTitle>
          <Typography.Text type="secondary">
            Welcome to Roombelt Timeline. <br />
            Please sign in with your account below.
          </Typography.Text>

          <LoginButtons>
            <Button size="large" onClick={() => signIn("google")}>
              <Image src={google} alt="" width={size} height={size} /> Continue with Google
            </Button>
            <Button size="large" onClick={() => signIn("azure-ad")}>
              <Image src={microsoft} alt="" width={size} height={size} /> Continue with Microsoft
            </Button>
          </LoginButtons>

          <Typography.Text type="secondary">
            <a href="example.com">Terms of Service</a> | <a href="example.com">Privacy Policy</a>
          </Typography.Text>
        </LoginCardContent>
      </Card>
    </LoginPageWrapper>
  );
}

const LoginPageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-image: linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginTitle = styled(Typography.Title)`
  margin: 0;
`;

const LoginCardContent = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const LoginButtons = styled.div`
  display: flex;
  justify-content: stretch;
  flex-direction: column;
  gap: 10px;
  margin: 25px 0 30px 0;
`;
