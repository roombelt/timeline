import styled from "styled-components";
import { App, Layout, ConfigProvider, Spin, Button, Space } from "antd";
import React, { Suspense, useEffect } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ErrorBoundary } from "react-error-boundary";

import AccountMenu from "./account-menu";
import { useActive } from "active-store";
import { useStore } from "../store";
import LoginPage from "../login";
import Feedback, { HeaderButton } from "./feedback";
import Link from "next/link";
import { GithubOutlined } from "@ant-design/icons";

dayjs.extend(localizedFormat);

const { Content, Header } = Layout;

export default function DefaultLayout({ children }: React.PropsWithChildren<{}>) {
  const store = useStore();
  const isAuthorized = useActive(store.isAuthorized.state);

  if (isAuthorized.status === "pending") {
    return null;
  }

  if (!isAuthorized.data) {
    return <LoginPage />;
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
              Roombelt Timeline
            </div>
            <Space>
              <Link href="https://github.com/ziolko/timeline" target="_blank" rel="noopener">
                <HeaderButton>
                  <GithubOutlined />
                </HeaderButton>
              </Link>
              <Suspense>
                <Feedback />
              </Suspense>
              <AccountMenu />
            </Space>
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

function ErrorFallback({ error }: { error: any }) {
  const store = useStore();
  useEffect(() => store.showApp(), [store]);

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
