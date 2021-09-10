import React from 'react';
import { Layout, Row, Col, Grid } from 'antd';
import Link from './Link';
import { helpUrls } from './HelpUrls';
import { useReferrer } from '../utils/referrer';
import FoorterLine from '../assets/footer-line.svg';

const { Footer } = Layout;
const { useBreakpoint } = Grid;

const footerElements = [
  {
    description: 'Atlas Developer Resources',
    link: helpUrls.developerResources,
  },
  { description: 'Discord', link: helpUrls.discord },
  { description: 'Telegram', link: helpUrls.telegram },
  { description: 'GitHub', link: helpUrls.github },
  { description: 'Project Atlas', link: helpUrls.projectSerum },
  { description: 'Solana Network', link: helpUrls.solanaBeach },
];

export const CustomFooter = () => {
  const smallScreen = !useBreakpoint().lg;
  const { refCode, allowRefLink } = useReferrer();
  return (
    <Footer
      style={{
        height: '55px',
        paddingBottom: 10,
        paddingTop: 10,
        background: 'transparent',
      }}
    >
      {refCode && allowRefLink && (
        <Row justify="center">Your referrer is {refCode}</Row>
      )}
      <Row align="middle" gutter={[16, 4]}>
        {!smallScreen && (
          <>
            <Col flex="auto" />
            {footerElements.map((elem, index) => {
              return (
                <Col key={index + ''}>
                  <Link external to={elem.link}>
                    {elem.description}
                  </Link>
                </Col>
              );
            })}
          </>
        )}
        <Col flex="auto">{/*  <DexProgramSelector />*/}</Col>
      </Row>
      <Row style={{ marginTop: '20px'}}>
        <img src={FoorterLine} alt="" width="100%" height="100%" />
      </Row>
      <Row>
        <div style={{textAlign : 'center' , width : '100%'}}>
          <div style={{ opacity: 0.7, color: 'gray', padding : '20px' }}>
            © 2021 Atlas, All Rights Reserved.
          </div>
        </div>
      </Row>
    </Footer>
  );
};
