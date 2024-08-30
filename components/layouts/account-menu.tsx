import { Button } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import styled from "styled-components";

export default function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div />;
  }

  if (status === "unauthenticated") {
    return (
      <AccountBox>
        <Button type="primary" onClick={() => signIn("google")}>
          Sign in
        </Button>
      </AccountBox>
    );
  }

  if (status === "authenticated") {
    return (
      <AccountBox onClick={() => signOut()}>
        <Image
          width={32}
          height={32}
          src={session.user.image!}
          alt="User avatar"
          unoptimized
        />
        {session.user.name}
      </AccountBox>
    );
  }
}

const AccountBox = styled.div`
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #888;
  padding: 10px 0;

  img {
    border-radius: 100%;
  }
`;
