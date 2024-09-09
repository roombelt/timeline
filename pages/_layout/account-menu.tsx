import { Dropdown } from "antd";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import styled from "styled-components";
import type { MenuProps } from "antd";

export default function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div />;
  }

  const items: MenuProps["items"] = [
    {
      key: "help",
      onClick: () => alert("Help"),
      label: "Help",
    },
    {
      key: "logout",
      onClick: () => signOut(),
      label: "Logout",
    },
  ];

  if (status === "authenticated") {
    return (
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
        <AccountBox>
          <AccountButton>
            <Image width={32} height={32} src={session.user.image!} alt="User avatar" unoptimized />
            {session.user.name}
          </AccountButton>
        </AccountBox>
      </Dropdown>
    );
  }
}

const AccountBox = styled.div`
  color: white;
  margin: 0;
  display: flex;
  justify-content: center;
`;

const AccountButton = styled.button`
  padding: 0;
  width: 100%;
  border: none;
  display: flex;
  background: transparent;
  color: inherit;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 0;
  cursor: pointer;

  img {
    border-radius: 100%;
  }

  &:hover,
  &:focus {
    background: transparent;
    backdrop-filter: brightness(80%);
  }
`;
