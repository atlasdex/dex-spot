import * as React from 'react';
import './index.css';
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
} from '../../charting_library';
import { useMarket, USE_MARKETS } from '../../utils/markets';
import * as saveLoadAdapter from './saveLoadAdapter';
import { flatten } from '../../utils/utils';
import { BONFIDA_DATA_FEED } from '../../utils/bonfidaConnector';
import { ThemeContext } from '../../App';

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  auto_save_delay: ChartingLibraryWidgetOptions['auto_save_delay'];

  // BEWARE: no trailing slash is expected in feed URL
  // datafeed: any;
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  containerId: ChartingLibraryWidgetOptions['container_id'];
  theme: string;
}

export interface ChartContainerState {}

export const TVChartContainer = () => {
  //get theme , nextTheme and toggle theme from context
  const { theme } = React.useContext(ThemeContext);

  // let datafeed = useTvDataFeed();
  const defaultProps: ChartContainerProps = {
    symbol: 'SOL/USDT',
    // @ts-ignore
    interval: ['1', '3', '5', '15', '30', '60', '120', '180', '240', '1D'],
    auto_save_delay: 5,
    theme: 'Dark',
    containerId: 'tv_chart_container',
    // datafeed: datafeed,
    libraryPath: '/charting_library/',
    chartsStorageApiVersion: '1.1',
    clientId: '0',
    userId: '0',
    fullscreen: false,
    autosize: true,
    datafeedUrl: BONFIDA_DATA_FEED,
    studiesOverrides: {},
  };

  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
  const { market } = useMarket();

  const chartProperties = JSON.parse(
    localStorage.getItem('chartproperties') || '{}',
  );

  React.useEffect(() => {
    const savedProperties = flatten(chartProperties, {
      restrictTo: ['scalesProperties', 'paneProperties', 'tradingProperties'],
    });

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol:
        USE_MARKETS.find(
          (m) => m.address.toBase58() === market?.publicKey.toBase58(),
        )?.name || 'SRM/USDC',
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      // @ts-ignore
      // datafeed: datafeed,
      // @ts-ignore
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        defaultProps.datafeedUrl,
      ),
      interval: defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
      container_id: defaultProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: defaultProps.libraryPath as string,
      auto_save_delay: 5,

      locale: 'en',
      disabled_features: [
        "use_localstorage_for_settings",
        "create_volume_indicator_by_default",
        "left_toolbar",
        "timeframes_toolbar",
        // "header_widget"
      ],
      enabled_features: ['study_templates'],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: 'Dark',
      overrides: theme
        ? {
            ...savedProperties,
            "paneProperties.backgroundType": "gradient", // or 'gradient'
            "paneProperties.background": "#1D1C28",
            "paneProperties.backgroundGradientStartColor": "#1D1C28",
            "paneProperties.backgroundGradientEndColor": "#1D1C28",
            "paneProperties.crossHairProperties.color": "#989898",
            "paneProperties.crossHairProperties.width": "1",
            "paneProperties.crossHairProperties.style": "2",
            "mainSeriesProperties.candleStyle.upColor": "#3FB68B",
          }
        : {
            ...savedProperties,

            "paneProperties.backgroundType": "gradient", // or 'gradient'
            "paneProperties.background": "#171516",
            "paneProperties.backgroundGradientStartColor": "#0E2036",
            "paneProperties.backgroundGradientEndColor": "#210922",

            "paneProperties.crossHairProperties.color": "#989898",
            "paneProperties.crossHairProperties.width": "1",
            "paneProperties.crossHairProperties.style": "2",

            "mainSeriesProperties.candleStyle.upColor": "#17a3e8",
            "mainSeriesProperties.candleStyle.downColor": "#ffffff",
            "mainSeriesProperties.candleStyle.borderUpColor": "#17a3e8",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ffffff",
            "mainSeriesProperties.candleStyle.wickUpColor": "#17a3e8",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ffffff",
          },
      // @ts-ignore
      save_load_adapter: saveLoadAdapter,
      settings_adapter: {
        initialSettings: {
          'trading.orderPanelSettingsBroker': JSON.stringify({
            showRelativePriceControl: false,
            showCurrencyRiskInQty: false,
            showPercentRiskInQty: false,
            showBracketsInCurrency: false,
            showBracketsInPercent: false,
          }),
          // "proterty"
          'trading.chart.proterty':
            localStorage.getItem('trading.chart.proterty') ||
            JSON.stringify({
              hideFloatingPanel: 1,
            }),
          'chart.favoriteDrawings':
            localStorage.getItem('chart.favoriteDrawings') ||
            JSON.stringify([]),
          'chart.favoriteDrawingsPosition':
            localStorage.getItem('chart.favoriteDrawingsPosition') ||
            JSON.stringify({}),
        },
        setValue: (key, value) => {
          localStorage.setItem(key, value);
        },
        removeValue: (key) => {
          localStorage.removeItem(key);
        },
      },
    };

    console.log('widgetOptions', widgetOptions);

    const tvWidget = new widget(widgetOptions);
    console.log('tvWidget', tvWidget);

    tvWidget.onChartReady(() => {
      tvWidgetRef.current = tvWidget;
      tvWidget
        // @ts-ignore
        .subscribe('onAutoSaveNeeded', () => tvWidget.saveChartToServer());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, tvWidgetRef.current,theme]);

  return <div id={defaultProps.containerId} className={'TVChartContainer'} />;
};
