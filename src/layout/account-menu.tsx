import { Dropdown } from "antd";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import styled from "styled-components";
import type { MenuProps } from "antd";
import placeholder from "./avatar-placeholder.jpg";
import { useStore } from "../store";

export default function AccountMenu() {
  const store = useStore();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div />;
  }

  const items: MenuProps["items"] = [
    {
      key: "export",
      onClick: store.export.show,
      label: "Export data",
    },
    {
      key: "logout",
      onClick: () => signOut(),
      label: "Logout",
    },
  ];

  if (status === "authenticated") {
    const userImage = session.user?.image ?? placeholder;
    return (
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
        <AccountButton>
          <Image width={24} height={24} src={userImage} alt="User avatar" unoptimized />
          {session.user.name}
        </AccountButton>
      </Dropdown>
    );
  }
}

const AccountButton = styled.button`
  color: white !important;
  padding: 3px 10px;
  border: none;
  display: flex;
  background: transparent;
  color: inherit;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;

  img {
    border-radius: 100%;
  }

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid #666;
  }
`;
