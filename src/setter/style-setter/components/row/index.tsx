import * as React from 'react';
import RadioGroup from '../radio-group';
import { RadioItem, StyleData, onStyleChange } from '../../utils/types';

import './index.less';
interface rowProps {
  title?: string;
  children?: any;
  // 如果不传styleData的话，radiogroup就变成非受控组件
  styleData?: StyleData | any;
  dataList?: Array<RadioItem>;
  styleKey?: string;
  onStyleChange?: onStyleChange;
  value?: string;
  contentStyle?: any;
  longTitle?: boolean
}

export default (props: rowProps) => {
  const { title, dataList, styleKey, children, styleData, contentStyle = {}, value, longTitle } = props;
  return (
    <div className="row-container">
      {title && (
        <div
          className={
            styleKey && styleData[styleKey]
              ? `${!longTitle?'title-contaienr':'title-contaienr-long'} title-text title-text-active`
              : `${!longTitle?'title-contaienr':'title-contaienr-long'} title-text`
          }
        >
          {title}
        </div>
      )}

      <div className="content-container" style={contentStyle}>
        {children ? (
          children
        ) : (
          <RadioGroup
            dataList={dataList}
            {...props}
            value={(styleData ? styleData[styleKey] : '') || value}
          ></RadioGroup>
        )}
      </div>
    </div>
  );
};
