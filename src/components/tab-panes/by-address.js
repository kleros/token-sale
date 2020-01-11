import { Button } from "antd";
import Copy from "copy-to-clipboard";
import QRCode from "qrcode.react"; // TODO should use hardcoded image for security?
import React, { useState } from "react";
import styled from "styled-components/macro";
import Translations from "../translations";

import { StyledText, StyledValueText } from "../typography";

const StyledPane = styled.div`
  text-align: center;
  padding: 0px 1vw 0px 1vw;
`;

const StyledButton = styled(Button)`
  color: white;
  height: 40px;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
  &:focus {
    color: white;
  }
  &:hover {
    color: white;
  }

  @media (max-width: 1178px) {
    font-size: 12px;
  }

  @media (max-width: 991px) {
    font-size: 14px;
  }
`;

const AddressResponsive = styled(StyledValueText)`
  font-size: 1.15vw;
  margin-top: 10px;
  font-family: monospace;

  @media (max-width: 991px) {
    font-size: 3vw;
  }
`;

const ByAddressPane = ({ contributionAddress, language }) => {
  const [state, setState] = useState({
    buttonText: Translations[language].body.basic.copyContrib
  });

  const CopyToClipboard = () => {
    Copy(contributionAddress);
    setState({
      buttonText: Translations[language].body.basic.copied
    });

    setTimeout(function() {
      setState({
        buttonText: Translations[language].body.basic.copyContrib
      });
    }, 500);
  };

  return (
    <StyledPane>
      <StyledText style={{ marginTop: "30px", marginBottom: "34px" }}>
        {Translations[language].body.basic.title}
      </StyledText>
      <QRCode
        value={contributionAddress}
        size={167}
        bgColor={"rgba(255, 255, 255, 0.9)"}
      />
      <AddressResponsive>{contributionAddress}</AddressResponsive>
      <StyledButton onClick={CopyToClipboard}>{state.buttonText}</StyledButton>
      <StyledText style={{ padding: "0px 1rem", marginTop: "55px" }}>
        {Translations[language].body.basic.disclaimer}
      </StyledText>
    </StyledPane>
  );
};

export default ByAddressPane;
