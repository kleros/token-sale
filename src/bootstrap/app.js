import "../styles/theme.css";
import { BrowserRouter, NavLink, Route, Switch } from "react-router-dom";
import { Col, Layout, Menu, Row, Select } from "antd";
import { DrizzleProvider, Initializer } from "../temp/drizzle-react-hooks";
import { Helmet } from "react-helmet";
import Home from "../containers/home";
import { ReactComponent as Logo } from "../assets/images/logo.svg";
import { StyledText } from "../components/typography";
import React, { useState } from "react";
import drizzle from "./drizzle";
import { register } from "./service-worker";
import styled from "styled-components/macro";
import media from "styled-media-query";
import { default as Footer } from "@kleros/react-components/dist/footer";
import Translations from "../components/translations";

const StyledLogoCol = styled(Col)`
  align-items: center;
  display: flex;
  height: 60px;
  justify-content: space-evenly;
`;

const StyledLeftCol = styled(Col)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${media.lessThan("768px")`
    /* screen width is less than 768px (medium) */
    display: none;
  `}
`;

const StyledColRight = styled(Col)`
  align-items: right;
  color: white;
  display: flex;
  height: 60px;
  justify-content: space-evenly;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${media.lessThan("992px")`
    /* screen width is less than 768px (medium) */
    display: none;
  `}
`;
const StyledLanguagesCol = styled(Col)`
  align-items: right;
  display: flex;
  height: 60px;
  justify-content: space-evenly;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledMenu = styled(Menu)`
  line-height: 60px !important;
  text-align: center;
`;
const StyledLayoutContent = styled(Layout.Content)`
  background-color: transparent;
  padding: 0px 7.575vw 100px 7.575vw;
`;
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  overflow-x: hidden;
`;
const StyledSelect = styled(Select)`
  .ant-select-selection {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    padding: 0px 10px;

    path {
      fill: white;
    }
  }

  width: 160px;
  margin-top: 15px;
`;

const getDefaultLanguage = () => {
  let language = (
    window.navigator.userLanguage ||
    window.navigator.language ||
    "en"
  ).split("-")[0];
  if (!Translations[language]) language = "en";
  return language;
};

export default () => {
  const [language, setLanguage] = useState(getDefaultLanguage());

  return (
    <>
      <Helmet>
        <title>Kleros Token Sale</title>
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:400,400i,500,500i,700,700i"
          rel="stylesheet"
        />
      </Helmet>
      <DrizzleProvider drizzle={drizzle}>
        <Initializer>
          <BrowserRouter>
            <StyledLayout>
              <Layout.Header>
                <Row>
                  <StyledLogoCol lg={3} md={6} sm={12} xs={12}>
                    <a href="https://kleros.io" style={{ marginTop: "20px" }}>
                      <Logo />
                    </a>
                  </StyledLogoCol>
                  <StyledLeftCol lg={3} md={10} offset={2}>
                    <StyledText>
                      {Translations[language].header.title}
                    </StyledText>
                  </StyledLeftCol>
                  <StyledColRight lg={10}>
                    <StyledText>
                      {Translations[language].header.dates}
                    </StyledText>
                  </StyledColRight>
                  <StyledLanguagesCol lg={6} md={6} xs={12}>
                    <StyledSelect
                      defaultValue={language}
                      onChange={val => {
                        setLanguage(val);
                      }}
                    >
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="es">Español</Select.Option>
                      <Select.Option value="fr">Français</Select.Option>
                      <Select.Option value="pt">Português</Select.Option>
                      <Select.Option value="tr">Türkçe</Select.Option>
                      <Select.Option value="ru">Русский</Select.Option>
                    </StyledSelect>
                  </StyledLanguagesCol>
                </Row>
              </Layout.Header>
              <StyledLayoutContent>
                <Switch>
                  <Route
                    component={() => <Home language={language} />}
                    exact
                    path="/"
                  />
                </Switch>
              </StyledLayoutContent>
              <Footer
                appName="Token Sale"
                contractExplorerURL={`https://etherscan.io/address/${
                  process.env.REACT_APP_KLEROS_TEST_SALE_ADDRESS
                }#code`}
                locale={language}
              />
            </StyledLayout>
          </BrowserRouter>
        </Initializer>
      </DrizzleProvider>
    </>
  );
};

register();
