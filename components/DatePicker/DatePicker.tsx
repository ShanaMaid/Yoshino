
import {Component} from 'react';
import * as React from 'react';
import * as classNames from 'classnames';
import {IBaseComponent, TSize} from '../template/component';
import Input from '../Input';
import Icon from '../Icon';
import PopOver from '../PopOver';
import * as moment from 'moment';

export interface IDatePickerProps extends IBaseComponent {
  /**
   * 默认提示文本
   */
  placeholder?: string;
  /**
   * 默认值
   */
  defaultValue?: number;
  /**
   * 值
   */
  value?: number;
  /**
   * 禁用
   */
  disabled?: boolean;
  /**
   * 值变化回调
   */
  onChange?: (v: number) => void;
  /**
   * 面板是否展开 - 受控
   */
  open?: boolean;
  /**
   * 面板是否展开 - 非受控
   */
  defaultOpen?: boolean;
  /**
   * 面板展开回调
   */
  onOpenChange?: (v: boolean) => void;
  /**
   * 尺寸
   */
  size?: TSize;
  /**
   * 展示时间格式
   */
  format?: string;
}

export interface IDatePickerState {
  open: boolean;
  value: number;
}

/**
 * **组件中文名称**-组件描述。
 */
export class DatePicker extends Component<IDatePickerProps, IDatePickerState> {
  preCls = 'yoshino-datepicker';

  static defaultProps = {
    size: 'default',
    placeholder: '请选择日期',
    defaultOpen: false,
    defaultValue: '',
    format: 'YYYY-MM-DD',
  };

  state = {
    open: this.props.defaultOpen!,
    value: this.props.defaultValue!,
  };

  getOpen = () => {
    const { open } = this.props;
    return open !== undefined ? open : this.state.open;
  }

  getValue = () => {
    const { value } = this.props;
    return value !== undefined ? value : this.state.value;
  }

  onOpenChange = (open: boolean) => {
    const { onOpenChange } = this.props;
    if (onOpenChange) {
      onOpenChange(open);
    }
    this.setState({
      open,
    });
  }

  onChange = (value: number) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
    this.setState({
      value,
    });
  }

  renderPop = () => {
    const valueR = this.getValue();
    const preCls = this.preCls;
    const { format, placeholder } = this.props;
    const m = valueR ? moment(valueR) :  moment();
    const weekArr = '日一二三四五六'.split('');
    const dayArr: Array<{
      tag: '-1' | '0' | '1'; // -1上月 0 本月 1下个月
      v: number;
      moment: string;
    }> = []; // 7 * 6 = 42;
    const currentMonthMax = moment([m.year(), m.month()]).endOf('month').date();
    const currentMonthWeek = moment([m.year(), m.month(), 1]).weekday();
    const preMonthMax = moment([m.year(), m.month()]).subtract(1, 'month').endOf('month').date();
    // 填充跟上个月的末尾天
    if (currentMonthWeek !== 7) {
      for (let i = 0; i < currentMonthWeek; i++) {
        const date = preMonthMax - i;
        dayArr.push({
          v: date,
          tag: '-1',
          moment: moment([m.year(), m.month(), date]).subtract(1, 'month').format(format),
        });
      }
    }

    // 本月天数填充
    for (let i = 0; i < currentMonthMax; i++) {
      const date = 1 + i;
      dayArr.push({
        v: 1 + i,
        tag: '0',
        moment: moment([m.year(), m.month(), date]).format(format),
      });
    }

    // 填充下个月开始天数
    for (let i = 0; dayArr.length < 42; i++) {
      const date = 1 + i;
      dayArr.push({
        v: 1 + i,
        tag: '1',
        moment: moment([m.year(), m.month(), date]).add(1, 'month').format(format),
      });
    }

    const renderDate = () => {
      let trKey = 0;
      let count = 0;
      const arr = [];
      let temp: JSX.Element[] = [];

      for (const day of dayArr) {
        const isCurrent = m.format(format) === day.moment;
        const cls = classNames(
          `${preCls}-table-cell`,
          {
            [`${preCls}-not-current-month`]: day.tag !== '0',
            [`${preCls}-selected-day`]: isCurrent,
          }
        );
        temp.push(
          <td
            key={count++}
            onClick={() => {
              let newM = moment([m.year(), m.month(), m.date()]);
              const tagAction = {
                '-1': () => {
                  newM = newM.subtract(1, 'month');
                },
                '0': () => -1,
                '1': () => {
                  newM = newM.add(1, 'month');
                },
              };
              tagAction[day.tag]();
              this.onChange(+newM.date(day.v).format('x'));
              this.onOpenChange(false);
            }}
          >
            <div className={cls}>{day.v}</div>
          </td>
        );

        if (count === 7) {
          arr.push(<tr key={trKey++}>{temp}</tr>);
          count = 0;
          temp = [];
        }
      }

      return arr;
    };
    return (
      <div className={`${preCls}-panel`}>
        <div className={`${preCls}-input-wrap`}>
          <input
            placeholder={placeholder}
            readOnly
            value={valueR ? moment(valueR).format(format) : ''}
          />
          <Icon
            type='ios-close-circle'
            onClick={this.onChange.bind(this, '')}
          />
        </div>
        <div className={`${preCls}-header`}>
          <Icon
            type='ios-rewind'
            className={`${preCls}-year-pre`}
            onClick={() => {
              this.onChange(+m.subtract(1, 'year').format('x'));
            }}
          />
          <Icon
            type='md-arrow-dropleft'
            className={`${preCls}-month-pre`}
            onClick={() => {
              this.onChange(+m.subtract(1, 'month').format('x'));
            }}
          />
          <span className={`${preCls}-time`}>
            {m.format('YYYY年MM月')}
          </span>
          <Icon
            type='md-arrow-dropright'
            className={`${preCls}-month-next`}
            onClick={() => {
              this.onChange(+m.add(1, 'month').format('x'));
            }}
          />
          <Icon
            type='ios-fastforward'
            className={`${preCls}-year-next`}
            onClick={() => {
              this.onChange(+m.add(1, 'year').format('x'));
            }}
          />
        </div>
        <div className={`${preCls}-body`}>
            <table>
              <thead>
                <tr>
                  {weekArr.map((item, key) => <th key={key}>{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderDate()}
              </tbody>
            </table>
        </div>
      </div>
    );
  }

  render() {
    const {
      className, style, size, open, defaultOpen,
      value, defaultValue, onChange, onOpenChange,
      placeholder, disabled, format, children,
      ...otherProps} = this.props;
    const preCls = this.preCls;
    const clsName = classNames(
      preCls, className,
    );
    const openR = this.getOpen();
    const valueR = this.getValue();

    return (
      <PopOver
        open={openR}
        onOpenChange={this.onOpenChange}
        pop={this.renderPop()}
      >
        <div
          className={clsName}
          style={style}
          {...otherProps}
        >
          <Input
            size={size}
            placeholder={placeholder}
            value={valueR ? moment(valueR).format(format) : ''}
            readOnly
          />
          <Icon className={`${preCls}-icon`} type='ios-calendar'/>
        </div>
      </PopOver>
    );
  }
}

export default DatePicker;
