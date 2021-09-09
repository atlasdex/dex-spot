import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Col, Menu, Popover, Row, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../assets/atlas.svg';
import styled from 'styled-components';
import { useWallet } from '../utils/wallet';
import { ENDPOINTS, useConnectionConfig } from '../utils/connection';
import Setting from './Setting';
import CustomClusterEndpointDialog from './CustomClusterEndpointDialog';
import { EndpointInfo } from '../utils/types';
import { notify } from '../utils/notifications';
import { Connection } from '@solana/web3.js';
import WalletConnect from './WalletConnect';
import AppSearch from './AppSearch';
import { getTradePageUrl } from '../utils/markets';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import { ImMenu4, ImMenu3 } from 'react-icons/im';
import { Switch } from 'antd';
import { ThemeContext } from '../App';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  color: white;
  justify-content: flex-end;
  padding: 0px 30px;
  flex-wrap: wrap;
`;

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0px 13px;
`;

const WalletSection = styled.div`
  display: flex;
  justify-content: row;
`;

const TreeWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 13px;
  width: 96%;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  img {
    height: 30px;
    margin-right: 8px;
    @media screen and (max-width: 758px) {
      margin-top: 4px;
      height: 32px;
    }
  }
`;

export default function TopBar() {
  const { connected, wallet } = useWallet();
  //get theme , nextTheme and toggle theme from context
  const { theme, toggleTheme } = React.useContext(ThemeContext);

  const {
    endpoint,
    endpointInfo,
    setEndpoint,
    availableEndpoints,
    setCustomEndpoints,
  } = useConnectionConfig();
  const [addEndpointVisible, setAddEndpointVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const [searchFocussed, setSearchFocussed] = useState(false);
  const [selectedNode, setSelectedNode] = useState('');

  const tradePageUrl = location.pathname.startsWith('/market/')
    ? location.pathname
    : getTradePageUrl();

  useEffect(() => {}, [location.pathname]);

  const treeNode = [
    {
      nodeId: '2',
      label: 'Dashboard',
      path: '/dashboard',
      disabled: true,
    },
    {
      nodeId: '3',
      label: 'TRADE',
      path: tradePageUrl,
      disabled: false,
    },
    {
      nodeId: '4',
      label: 'BALANCES',
      path: '/balances',
      disabled: !connected,
    },
    {
      nodeId: '5',
      label: 'ORDERS',
      path: '/orders',
      disabled: !connected,
    },
    {
      nodeId: '6',
      label: 'Swap',
      path: '/swap',
      disabled: true,
    },
    {
      nodeId: '7',
      label: 'Perpetual Futures',
      path: '/perpetual-futures',
      disabled: true,
    },
    {
      nodeId: '8',
      label: 'Yield Aggregator',
      path: '/yield-aggregator',
      disabled: true,
    },
  ];

  //set selected Node
  useEffect(() => {
    treeNode.map((node, index) => {
      if (location.pathname === node.path) {
        setSelectedNode(node.nodeId);
      }
    });
  }, [location.pathname]);

  //Dimensions of the web screen width x height
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const width = dimensions?.width;

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = useCallback(
    (e) => {
      history.push(e.key);
    },
    [history],
  );

  const onAddCustomEndpoint = (info: EndpointInfo) => {
    const existingEndpoint = availableEndpoints.some(
      (e) => e.endpoint === info.endpoint,
    );
    if (existingEndpoint) {
      notify({
        message: `An endpoint with the given url already exists`,
        type: 'error',
      });
      return;
    }

    const handleError = (e) => {
      console.log(`Connection to ${info.endpoint} failed: ${e}`);
      notify({
        message: `Failed to connect to ${info.endpoint}`,
        type: 'error',
      });
    };

    try {
      const connection = new Connection(info.endpoint, 'recent');
      connection
        .getEpochInfo()
        .then((result) => {
          setTestingConnection(true);
          console.log(`testing connection to ${info.endpoint}`);
          const newCustomEndpoints = [
            ...availableEndpoints.filter((e) => e.custom),
            info,
          ];
          setEndpoint(info.endpoint);
          setCustomEndpoints(newCustomEndpoints);
        })
        .catch(handleError);
    } catch (e) {
      handleError(e);
    } finally {
      setTestingConnection(false);
    }
  };
  const handleMobileClick = (path) => {
    history.push(path);
  };

  //render menu for full size screens
  const RenderNormal = () => {
    return (
      <Wrapper>
        <LogoWrapper onClick={() => history.push(tradePageUrl)}>
          <img src={logo} alt="" />
        </LogoWrapper>
        <Menu
          mode="vertical"
          onClick={handleClick}
          selectedKeys={[location.pathname]}
          style={{
            border: 'none',
            color: 'white',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            flex: 1,
          }}
        >
          <Menu.Item disabled key={'/dashboard'}>
            Dashboard
          </Menu.Item>

          {/* Sub menu for trade */}
          <Menu.SubMenu
            key={tradePageUrl}
            onTitleClick={() => history.push(tradePageUrl)}
            title="TRADE"
          >
            <Menu.Item disabled={!connected} key="/balances">
              BALANCES
            </Menu.Item>
            <Menu.Item disabled={!connected} key="/orders">
              ORDERS
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item disabled key="/swap">
            Swap
          </Menu.Item>
          <Menu.Item key="/leader-board">Leaderboard</Menu.Item>
          <Menu.Item disabled key="/perpetual-futures">
            Perpetual Futures
          </Menu.Item>

          <Menu.Item disabled key="/yield-aggregator">
            Yield Aggregator
          </Menu.Item>
        </Menu>
        {connected && (
          <div>
            <Popover
              content={<Setting autoApprove={wallet?.autoApprove} />}
              placement="bottomRight"
              title="Settings"
              trigger="click"
            >
              <Button style={{ marginRight: 8 }}>
                <SettingOutlined />
                Settings
              </Button>
            </Popover>
          </div>
        )}
        <div>
          <WalletConnect />
          <Switch
            checked={theme}
            onChange={toggleTheme}
            style={{ marginLeft: 40 }}
          />
        </div>
      </Wrapper>
    );
  };

  // render menu for small screens
  const RenderSmall = () => {
    return (
      <>
        <MobileWrapper>
          <LogoWrapper onClick={() => history.push(tradePageUrl)}>
            <img src={logo} alt="" />
          </LogoWrapper>
          <WalletSection>
            {connected && (
              <div>
                <Popover
                  content={<Setting autoApprove={wallet?.autoApprove} />}
                  placement="bottomRight"
                  title="Settings"
                  trigger="click"
                >
                  <Button style={{ marginRight: 8 }}>
                    <SettingOutlined />
                    Settings
                  </Button>
                </Popover>
              </div>
            )}
            <div>
              <WalletConnect />
              <Switch
            checked={theme}
            onChange={toggleTheme}
            style={{ marginLeft: 10 }}
          />
            </div>
          </WalletSection>

        </MobileWrapper>

        <TreeWrapper>
          <TreeView
            aria-label="disabled items"
            style={{ width: '100vw' }}
            defaultCollapseIcon={<ImMenu4 style={{ fontSize: '50px' }} />}
            defaultExpandIcon={<ImMenu3 style={{ fontSize: '50px' }} />}
            selected={selectedNode}
          >
            <TreeItem
              style={{ background: 'transparant', marginBottom: '15px' }}
              nodeId="1"
              label=""
            >
              {treeNode.map((node, index) => {
                return (
                  <TreeItem
                    key={index}
                    nodeId={node.nodeId}
                    onClick={() => {
                      handleMobileClick(node.path);
                    }}
                    label={node.label}
                    disabled={node.disabled}
                  />
                );
              })}
            </TreeItem>
          </TreeView>
        </TreeWrapper>
      </>
    );
  };

  const component = (() => {
    if (width < 720) {
      return <RenderSmall />;
    } else {
      return <RenderNormal />;
    }
  })();

  const endpointInfoCustom = endpointInfo && endpointInfo.custom;
  useEffect(() => {
    const handler = () => {
      if (endpointInfoCustom) {
        setEndpoint(ENDPOINTS[0].endpoint);
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [endpointInfoCustom, setEndpoint]);

  return (
    <>
      <CustomClusterEndpointDialog
        visible={addEndpointVisible}
        testingConnection={testingConnection}
        onAddCustomEndpoint={onAddCustomEndpoint}
        onClose={() => setAddEndpointVisible(false)}
      />

      {component}

      {/* {!searchFocussed && (
            <Menu.SubMenu
              title="LEARN"
              onTitleClick={() =>
                window.open(EXTERNAL_LINKS['/learn'], '_blank')
              }
              style={{ margin: '0 0px 0 10px' }}
            >
              <Menu.Item key="/add-market">
                <a
                  href={EXTERNAL_LINKS['/add-market']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Adding a market
                </a>
              </Menu.Item>
              <Menu.Item key="/wallet-support">
                <a
                  href={EXTERNAL_LINKS['/wallet-support']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supported wallets
                </a>
              </Menu.Item>
              <Menu.Item key="/dex-list">
                <a
                  href={EXTERNAL_LINKS['/dex-list']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DEX list
                </a>
              </Menu.Item>
              <Menu.Item key="/developer-resources">
                <a
                  href={EXTERNAL_LINKS['/developer-resources']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Developer resources
                </a>
              </Menu.Item>
              <Menu.Item key="/explorer">
                <a
                  href={EXTERNAL_LINKS['/explorer']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solana block explorer
                </a>
              </Menu.Item>
              <Menu.Item key="/srm-faq">
                <a
                  href={EXTERNAL_LINKS['/srm-faq']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SRM FAQ
                </a>
              </Menu.Item>
            </Menu.SubMenu>
          )} */}
      {/* <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: 5,
          }}
        >
          <AppSearch
            onFocus={() => setSearchFocussed(true)}
            onBlur={() => setSearchFocussed(false)}
            focussed={searchFocussed}
            width={searchFocussed ? '350px' : '35px'}
          />
        </div> */}
      {/* <div>
          <Row
            align="middle"
            style={{ paddingLeft: 5, paddingRight: 5, color: 'white' }}
            gutter={16}
          >
            <Col>
              <PlusCircleOutlined
                style={{ color: '#2abdd2' }}
                onClick={() => setAddEndpointVisible(true)}
              />
            </Col>
            <Col>
              <Popover
                content={endpoint}
                placement="bottomRight"
                title="URL"
                trigger="hover"
              >
                <InfoCircleOutlined style={{ color: '#2abdd2' }} />
              </Popover>
            </Col>
            <Col>
              <Select
                onSelect={setEndpoint}
                value={endpoint}
                style={{ marginRight: 8, width: '150px', color: 'white' }}
              >
                {availableEndpoints.map(({ name, endpoint }) => (
                  <Select.Option value={endpoint} key={endpoint}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div> */}
    </>
  );
}
