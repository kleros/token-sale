import { ReactComponent as Acropolis } from '../assets/images/acropolis.svg'
import React from 'react'
import styled from 'styled-components/macro'

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  min-height: ${props => (props.Web3 ? '100vh' : 'calc(100vh - 64px)')};
  margin: 0 -9.375vw -62px;
`
const StyledAcropolis = styled(Acropolis)`
  height: auto;
  width: 100%;
`
const StyledInfoDiv = styled.div`
  flex: 1;
  padding: 0 9.375vw 62px;
  text-align: center;
`
const Styled404Div = styled.div`
  font-size: 88px;
  font-weight: bold;
  line-height: 112px;
  margin-top: 15px;
`
const StyledMessageLine1 = styled.div`
  font-size: 28px;
  font-weight: bold;
`
const StyledMessageLine2 = styled.div`
  font-size: 24px;
  margin-top: 50px;
`
const StyledMessageLine3 = styled.div`
  font-size: 16px;
  margin-top: 25px;
`
const _404 = () => (
  <StyledDiv Web3={true}>
    <StyledAcropolis />
    <StyledInfoDiv className="quaternary-background theme-background">
      <Styled404Div className="primary-color theme-color">
        {'Wrong Ethereum Network'}
      </Styled404Div>
      <StyledMessageLine2 className="ternary-color theme-color">
        {'Please switch to Mainnet or disable your Web3 wallet to participate in the Kleros Token Sale'}
      </StyledMessageLine2>
    </StyledInfoDiv>
  </StyledDiv>
)

export default _404
