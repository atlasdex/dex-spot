import * as React from 'react';
import styled from 'styled-components/macro';
import Link from './../../components/Link';
import { Helmet } from 'react-helmet';
import { StyleConstants } from './StyleConstants';
import { P } from './P';
import { getTradePageUrl } from '../../utils/markets';
import { useLocation } from 'react-router-dom';

export const NotFoundPage = () => {
  const location = useLocation();

  const tradePageUrl = location.pathname.startsWith('/market/')
    ? location.pathname
    : getTradePageUrl();

  return (
    <>
      <Helmet>
        <title>404 Page Not Found</title>
        <meta name="description" content="Page not found" />
      </Helmet>
      <Wrapper>
        {/* <ImageWrapper src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif" /> */}
        <ErrorPage>
          Oops! <P>Sorry , The Page You Requested Was Not Found</P>
        </ErrorPage>

        <Title>
          4{' '}
          <ImageWrapper src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif" />{' '}
          4
        </Title>
        <LinkButton>
          <Link to={tradePageUrl}>Home Page</Link>
        </LinkButton>
        {/* <ErrorPage>404</ErrorPage> */}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  height: calc(100vh - ${StyleConstants.NAV_BAR_HEIGHT});
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 320px;
`;

const ImageWrapper = styled.img`
  width: 90px;
  height: 80px;
  border-radius: 40px;
  @media screen and (max-width: 900px) {
    width: 50px;
    height: 50px;
  }
`;

const Title = styled.div`
  margin-top: -1vh;
  font-weight: bold;
  font-size: 5.375rem;
  word-spacing: -15px;
  @media screen and (max-width: 900px) {
    font-size: 3.375rem;
    word-spacing: -8px;
  }
`;

const LinkButton = styled.div`
  color: #fff !important;
  padding: 5px 10px;
  background: tranparent;
  border: 1px solid gray;
  margin-top: 2vh;
  border-radius: 10px;
  display: inline-block;
`;

const ErrorPage = styled.h1`
  font-family: montserrat, sans-serif;
  font-size: 50px;
  margin: 0;
  font-weight: 900;
  background: gray;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media screen and (max-width: 900px) {
    font-size: 70px;
  }
`;
