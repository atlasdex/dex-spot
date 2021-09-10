import { createGlobalStyle } from 'styled-components';

export const BlueThemeStyle = createGlobalStyle`
#root{
  background: #1D1C28;
  color: white;
}
html,body{
  background: #1D1C28;
  color: white;
}
input[type=number]::-webkit-inner-spin-button {
  opacity: 0;
}
input[type=number]:hover::-webkit-inner-spin-button,
input[type=number]:focus::-webkit-inner-spin-button {
  opacity: 0.25;
}

/* width */
::-webkit-scrollbar {
  width: 15px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #2d313c;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #5b5f67;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #5b5f67;
}

.container-sm{
  margin-left : 100px;
  margin-right : 100px;
}
.ant-slider-track, .ant-slider:hover .ant-slider-track {
  background-color: #2abdd2;
  opacity: 0.75;
}
.ant-slider-track,
.ant-slider ant-slider-track:hover {
  background-color: #2abdd2;
  opacity: 0.75;
}
.ant-slider-dot-active,
.ant-slider-handle,
.ant-slider-handle-click-focused,
.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open)  {
  border: 2px solid #2abdd2; 
}
.ant-table-cell{
  color : white !important;
  border-color: gray !important;
  
}

.ant-input{
  color : white !important;
}
.ant-slider-mark-text-active{
  color : rgb(186, 6, 251) !important;

}
.ant-slider-mark-text{
  color : white !important;
}
.ant-table-tbody > tr.ant-table-row:hover > td {
  background: #1D1C28;
}
.ant-btn-lg{
  color : gray !important;
}
.ant-layout-header{
  border-bottom : 1px solid gray;
  background: transparent !important;
}
.ant-modal-content{
  border-radius: 13.2692px;
}
.ant-btn{
  color : gray !important;
  background : #1D1C28  !important;
}
.ant-switch-checked{
  background-color: #2abdd2 !important;
}
.ant-notification-notice{
  color : black !important ;
}

.ant-table-container table > thead > tr:first-child th {
  border-bottom: none;
}
.ant-divider-horizontal.ant-divider-with-text::before, .ant-divider-horizontal.ant-divider-with-text::after {
  border-top: 1px solid #434a59 !important;
}
.ant-table-tbody{
  background: #1D1C28 ;
}
.ant-typography{
  color : white;
}
.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  background-color: transparent !important;
}
.ant-tabs-content-holder{
  overflow : auto !important;
}
.ant-layout {
  color: white;
  background: transparent !important;
  }
  .ant-table {
    background: #212734;
  }
  .ant-table-thead > tr > th {
    background: #363439;
    color : white !important;
    &:hover{
      background: gray !important;
    }
 }
 .MuiTreeItem-iconContainer {
   width : 41px !important;
 }
.Mui-focused{
  background: transparent !important;
 }

.ant-select-item-option-content {
  img {
    margin-right: 4px;
  }
}
.anticon{
  color : white;
}
.ant-menu-submenu-title , .ant-menu-item-only-child{
  margin-bottom : 8px !important;
}
.ant-btn-primary{
  color : black !important;
}
.ant-modal-content {
  color : white;
  background: #1D1C28;
}

@-webkit-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
@-moz-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
@-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
.flash {
  -moz-animation: highlight 0.5s ease 0s 1 alternate ;
  -webkit-animation: highlight 0.5s ease 0s 1 alternate;
  animation: highlight 0.5s ease 0s 1 alternate;
}`;
