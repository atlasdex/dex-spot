import React from 'react';
import styled from 'styled-components';

//import theme context here
import { ThemeContext } from './../../App';

const PurpleThemeWrapper = styled.div`
  margin: 5px;
  padding: 20px;
  background: black;
  color: white;
`;

const BlueThemeWrapper = styled.div`
  margin: 5px;
  padding: 20px;
  background: #1d1c28;
  border: 1px solid #2d2d3d;
  color: white;
`;

export default function FloatingElement({
  style = undefined,
  children,
  stretchVertical = false,
}) {
  //get theme , nextTheme and toggle theme from context
  const { theme } = React.useContext(ThemeContext);

  return (
    <>
      {theme ? (
        <BlueThemeWrapper
          style={{
            height: stretchVertical ? 'calc(100% - 10px)' : undefined,
            ...style,
          }}
        >
          {children}
        </BlueThemeWrapper>
      ) : (
        <PurpleThemeWrapper
          style={{
            height: stretchVertical ? 'calc(100% - 10px)' : undefined,
            ...style,
          }}
        >
          {children}
        </PurpleThemeWrapper>
      )}
    </>
  );
}
