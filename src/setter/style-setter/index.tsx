/* eslint-disable react/no-access-state-in-setstate */
import * as React from 'react';
import { ConfigProvider, Icon, Select } from '@alifd/next';
import Row from './components/row';
import Layout from './pro/layout';
import Position from './pro/position';
import Font from './pro/font';
import Border from './pro/border';
import Background from './pro/background';
import CssCode from './components/css-code';
import { StyleData } from './utils/types';
import './index.less';
import { parseToCssCodePure, parseToStyleData } from './utils';

interface StyleSetterProps {
  value: string | null;
  defaultValue: string;
  placeholder: string;
  field: any;
  onChange: (val: any) => void;
  isShowCssCode: boolean;
  showModuleList: string[];
}

export type CssStatus = 'default' | 'hover' | 'active' | 'focus' | string;

interface StyleSetterState {
  styleData: Partial<Record<CssStatus, any>>;
  cssStatusList: Array<{label: CssStatus, value: string}>;
  cssStatusListPre: Array<{label: CssStatus, value: string}>;
  cssStatus: CssStatus;
  cssCodeVisiable: boolean;
  initFlag: boolean;
}
export default class StyleSetterV2 extends React.PureComponent<StyleSetterProps, StyleSetterState> {
  static defaultProps = {
    // 默认单位
    unit: 'px',
    // 默认计算尺寸缩放
    placeholderScale: 1,
    // 展示板块
    showModuleList: ['background', 'border', 'font', 'layout', 'position'],
    // 是否展示css源码编辑面板
    isShowCssCode: true,
    // layout 配置面板
    layoutPropsConfig: {
      // display 展示列表
      showDisPlayList: ['inline', 'flex', 'block', 'inline-block', 'none'],
      isShowPadding: true,
      isShowMargin: true,
      isShowWidthHeight: true,
    },

    fontPropsConfig: {
      // fontFamily列表
      fontFamilyList: [
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Arial', label: 'Arial' },
        { value: 'serif', label: 'serif' },
      ],
    },

    // position 配置面板
    positionPropsConfig: {
      isShowFloat: true,
      isShowClear: true,
    },
  };

  state: StyleSetterState = { 
    styleData: { 
      default: {},
      hover: {},
      active: {},
      focus: {} 
    },
    cssStatusListPre: [
      { label: '默认', value: 'default' },
      { label: ':hover', value: 'hover' },
      { label: ':focus', value: 'focus' },
      { label: ':active', value: 'active' },
    ],
    cssStatusList: [
      { label: '默认', value: 'default' },
      { label: ':hover', value: 'hover' },
      { label: ':focus', value: 'focus' },
      { label: ':active', value: 'active' },
    ],
    cssStatus: 'default',
    cssCodeVisiable: false,
    initFlag: false
  };

  componentDidMount() {
    const { value } = this.props;

    // 兼容原来将导出styleObj的情况
    const selected = (this.props as any).selected; // 选中的节点
    const styleObj = selected.getProps().getPropValue('style')
    if (styleObj) {
      this.setState({
        styleData: {
          ...this.state.styleData,
          default: styleObj
        }
      }, () => {
        const cssText = parseToCssCodePure(this.state.styleData, (this.props as any).selected._id)
  
        const { onChange } = this.props;
        onChange && onChange(cssText);
        const prop = selected.getProps().getProp('style');
        prop.setValue({});
        prop.remove({});
      })
    }
    // 兼容代码结束

    if (value) {
      const obj = parseToStyleData(value, (this.props as any).selected._id)
      this.setState({
        styleData: obj,
      }, () => {
        const temp: Array<{label: CssStatus, value: string}> = []
        Object.keys(this.state.styleData).forEach((key) => {
          switch (key) {
            case 'default':
            case 'hover':
            case 'active':
            case 'focus':
              break;
            default:
              temp.push({ label: key, value: key })
          }
        })
        this.setState({
          cssStatusList: [...this.state.cssStatusList, ...temp],
          cssStatusListPre: [...this.state.cssStatusList, ...temp],
        })
      });
    }

    this.setState({
      initFlag: true,
    });
  }

  changeCssCodeVisiable = (visible: boolean) => {
    this.setState({
      cssCodeVisiable: !visible,
    });
  };

  /**
   * style更改
   * @param styleKey
   * @param value
   */
  onStyleChange = (styleDataList: StyleData[]) => {
    const { onChange } = this.props;
    const styleObj: any = Object.assign({}, this.state.styleData[this.state.cssStatus]);
    styleDataList &&
      styleDataList.map((item) => {
        if (item.value == undefined || item.value == null) {
          delete styleObj[item.styleKey];
        } else {
          styleObj[item.styleKey] = item.value;
        }
      });

    const styleData = {
      ...this.state.styleData,
      [this.state.cssStatus]: styleObj
    }
    
    this.setState({
      styleData
    });

    const cssText = parseToCssCodePure(styleData, (this.props as any).selected._id)

    onChange && onChange(cssText);
  };

  onStyleDataChange = (styleData: Partial<Record<CssStatus, any>>) => {
    this.setState({
      styleData
    });
    const { onChange } = this.props;

    const cssText = parseToCssCodePure(styleData, (this.props as any).selected._id)

    onChange && onChange(cssText);
  };

  handleStatusSearch = (value: string) => {
    this.setState({cssStatusList: [{label: value, value }]})
  }
  
  handleStatusChang = (value: string) => {
    let isNewFiled = true
    this.state.cssStatusListPre.forEach(item => {
      if (item.value === value) {
        isNewFiled = false;
      }
    })

    if (isNewFiled) {
      this.setState({
        cssStatusList: [
          ...this.state.cssStatusListPre,
          { label: value, value}
        ],
        cssStatusListPre: [
          ...this.state.cssStatusListPre,
          { label: value, value}
        ]
      })
    } else {
      this.setState({
        cssStatusList: this.state.cssStatusListPre,
      })
    }
    this.setState({ cssStatus: value })
  }

  handleStatusBlur = () => {
    this.setState({
      cssStatusList: this.state.cssStatusListPre,
    })
  }

  render() {
    const { isShowCssCode, showModuleList } = this.props;
    const { styleData, cssStatus } = this.state;

    const isDefaultStatus = (value: string) => {
      switch (value) {
        case 'default':
        case 'hover':
        case 'active':
        case 'focus':
          return true;
        default:
          return false;
      }
    }
    const itemRender = (item: any) => {
      const className = 'lowcode-setter-style-v2-select-status-item';
      return <div className={className}>
        {item.label}
        {!isDefaultStatus(item.value) && <div
          className={`${className}-close`}
          onClick={() => {
            this.setState({
              cssStatusList: this.state.cssStatusList.filter((i) => i.value !== item.value),
              cssStatusListPre: this.state.cssStatusListPre.filter((i) => i.value !== item.value),
            })
            this.setState({ cssStatus: 'default' })
          }}
        >
          <Icon
            size='xxs'
            type="close" 
          />
        </div>}
      </div>;
    };

    return (
      <ConfigProvider>
        <div className="lowcode-setter-style-v2">
          {isShowCssCode && (
            <div className="top-bar">
              {/* <div
                onClick={() => this.changeCssCodeVisiable(false)}
                className={cssCodeVisiable ? 'top-icon-active' : 'top-icon'}
              >
                <Icon type="icon-CSS"></Icon>
              </div> */}

              <CssCode styleData={styleData} onStyleDataChange={this.onStyleDataChange} />
            </div>
          )}
          <Row title="状态" >
            <Select
              showSearch
              style={{ width: '90%' }}
              filterLocal={false}
              dataSource={this.state.cssStatusList}
              onSearch={this.handleStatusSearch}
              value={cssStatus}
              onChange={this.handleStatusChang}
              onBlur={this.handleStatusBlur}
              itemRender={itemRender}
            />
          </Row>
          {showModuleList.filter((item) => item == 'layout').length > 0 && (
            <Layout
              onStyleChange={this.onStyleChange}
              styleData={styleData[cssStatus] || {}}
              {...this.props}
             />
          )}

          {showModuleList.filter((item) => item == 'font').length > 0 && (
            <Font onStyleChange={this.onStyleChange} styleData={styleData[cssStatus] || {}} {...this.props} />
          )}

          {showModuleList.filter((item) => item == 'background').length > 0 && (
            <Background
              onStyleChange={this.onStyleChange}
              styleData={styleData[cssStatus] || {}}
              {...this.props}
             />
          )}

          {showModuleList.filter((item) => item == 'position').length > 0 && (
            <Position
              onStyleChange={this.onStyleChange}
              styleData={styleData[cssStatus] || {}}
              {...this.props}
             />
          )}

          {showModuleList.filter((item) => item == 'border').length > 0 && (
            <Border
              onStyleChange={this.onStyleChange}
              styleData={styleData[cssStatus] || {}}
              {...this.props}
             />
          )}

          {/* {initFlag && (
            <CssCode
              visible={cssCodeVisiable}
              styleData={styleData[cssStatus]}
              onStyleDataChange={this.onStyleDataChange}
              changeCssCodeVisiable={this.changeCssCodeVisiable}
            ></CssCode>
          )} */}
        </div>
      </ConfigProvider>
    );
  }
}
