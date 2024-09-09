import styled, { createGlobalStyle } from "styled-components";
import { App, Layout, ConfigProvider, Spin, Button } from "antd";
import Head from "next/head";
import React, { Suspense, useEffect } from "react";
import { ExportOutlined, ScheduleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ErrorBoundary } from "react-error-boundary";

import AccountMenu from "./account-menu";
import { signIn } from "next-auth/react";
import store from "../_store";
import { useActive } from "active-store";

dayjs.extend(localizedFormat);

const { Content, Header } = Layout;

export default function DefaultLayout({ children }: React.PropsWithChildren<{}>) {
  const hasAccess = useActive(store.hasAccessToCalendars.state);

  if (hasAccess.status === "pending") {
    return null;
  }

  if (!hasAccess.data) {
    return <SignIn />;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerHeight: 40,
          },
        },
      }}
    >
      <App className="ant-app">
        <Layout id="main-layout">
          <Head>
            <title>Roombelt calendar utils</title>
            <meta name="description" content="Various utilities for calendar" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <GlobalStyles />
          <Header
            style={{
              position: "sticky",
              top: 0,
              padding: "0 10px",
              zIndex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                flex: 1,
                marginRight: 20,
                flexDirection: "row",
                color: "white",
                fontSize: 16,
              }}
            >
              Roombelt Office Manager
            </div>
            {/* <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[router.pathname]}
              items={items}
              style={{ flex: 1, minWidth: 0 }}
              onSelect={(item) => router.push(item.key)}
            /> */}
            <AccountMenu />
          </Header>
          <Content style={{ margin: 0, padding: 0, background: "white" }}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<FullPageLoader />} children={children} />
            </ErrorBoundary>
          </Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}

function SignIn() {
  useEffect(store.showApp, []);

  return (
    <FullPageLoaderWrapper>
      <div>Please sign in below.</div>
      <Button type="primary" onClick={() => signIn("google")}>
        Sign in with Google
      </Button>
    </FullPageLoaderWrapper>
  );
}

function ErrorFallback({ error }: { error: any }) {
  useEffect(store.showApp, []);

  return (
    <FullPageLoaderWrapper>
      <div>There was an error while loading the page:</div>
      <div>{error.message}</div>
      <Button type="primary" onClick={() => (window.location.href = window.location.href)}>
        Reload page
      </Button>
    </FullPageLoaderWrapper>
  );
}

function FullPageLoader() {
  return (
    <FullPageLoaderWrapper>
      <Spin size="large" />
      <div>Loading your calendars...</div>
    </FullPageLoaderWrapper>
  );
}

const FullPageLoaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-direction: column;
  font-size: 18px;
`;

const items: { key: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "/",
    label: "Planner",
    icon: <ScheduleOutlined />,
  },
  {
    key: "/export",
    label: "Export",
    icon: <ExportOutlined />,
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
