import styled, { createGlobalStyle } from "styled-components";
import { App, Layout, Menu, Card, theme } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { Suspense } from "react";
import { HomeOutlined, ExportOutlined, ScheduleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

import logo from "./logo.png";
import AccountMenu from "./account-menu";

dayjs.extend(localizedFormat);

const { Content, Footer, Sider } = Layout;

export default function DefaultLayout({ children }: React.PropsWithChildren<{}>) {
  const router = useRouter();

  const page = items.find((item) => item?.key === router.pathname);
  return (
    <App className="ant-app">
      <Layout id="main-layout" hasSider>
        <Head>
          <title>Roombelt calendar utils</title>
          <meta name="description" content="Various utilities for calendar" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <GlobalStyles />
        <FixedSider>
          <Logo src={logo.src} />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[router.pathname]}
            items={items}
            onSelect={(item) => router.push(item.key)}
          />
          <AccountMenu />
        </FixedSider>
        <PageWrapper>
          <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
            <Card title={page?.label ?? "Roombelt Utils"}>
              <Suspense fallback="Loading data...">{children}</Suspense>
            </Card>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Roombelt Utils©{new Date().getFullYear()} Created by Mateusz Zieliński
          </Footer>
        </PageWrapper>
      </Layout>
    </App>
  );
}

const items: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "/",
    label: "Home",
    icon: <HomeOutlined />,
  },
  {
    key: "/export",
    label: "Export to Excel",
    icon: <ExportOutlined />,
  },
  {
    key: "/book",
    label: "Meeting planner",
    icon: <ScheduleOutlined />,
  },
];

const GlobalStyles = createGlobalStyle`
  body, html, #__next, #main-layout, .ant-app {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }
`;

const Logo = styled.img`
  width: 160px;
  margin: 20px auto;
  display: block;
  filter: grayscale(1) brightness(4);
`;

const FixedSider = styled(Sider)`
  position: fixed !important;
  margin: 0;
  padding: 0;
  overflow: auto;
  height: 100vh;
  inset-inline-start: 0;
  top: 0;
  bottom: 0;
  scrollbar-width: thin;
  scrollbar-color: unset;

  .ant-layout-sider-children {
    display: grid;
    grid-template-rows: auto 1fr auto auto;
  }
`;

const PageWrapper = styled(Layout)`
  margin-left: 200px;
  display: grid;
  min-height: 100%;
  grid-template-rows: minmax(max-content, 1fr) auto;
`;
