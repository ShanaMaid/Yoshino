// tslint:disable no-any
import {Component} from 'react';
import * as React from 'react';
import * as classNames from 'classnames';
import Input from '../Input';
import {IInputProps} from '../Input/Input';
import Transitions from '../Transitions';
import Pop from '../Pop';

const { Expand } = Transitions;

export interface IAutoCompleteProps extends IInputProps {
  /**
   * 自动补全数据源
   */
  dataSource: any[];
  /**
   * 高亮第一项
   */
  activeFirstOption?: boolean;
  /**
   * 自定义过滤函数
   */
  onFilter?: (value: any, dataSource: any[]) => string[];
}

export interface IAutoCompleteState {
  options: any[]; // 符合条件的筛选项
  show: boolean; // 控制下拉框显示
  active: number; // 下拉框高亮项
  value: any;
}

/**
 * **自动完成**-用于辅助补全输入项
 */
export class AutoComplete extends Component<IAutoCompleteProps, IAutoCompleteState> {
  refInput: HTMLInputElement;
  intervalHanlde = 0;
  listShowTimeout = 0;

  static defaultProps = {
    activeFirstOption: false,
    defaultValue: '',
    dataSource: [],
  };

  state = {
    options: this.props.dataSource,
    show: false,
    active: this.props.activeFirstOption ? 0 : -1,
    value: this.props.defaultValue!,
  };

  UNSAFE_componentWillReceiveProps(netxProps: IAutoCompleteProps) {
    const { dataSource } = this.props;
    const { dataSource: nextDataSource } = netxProps;
    if (JSON.stringify(dataSource) !== JSON.stringify(nextDataSource)) {
      this.setState({
        options: nextDataSource.filter((item) => {
          return String(item).match(new RegExp(this.getValue() + ''));
        }),
      });
    }
  }

  onFocus: React.FormEventHandler<HTMLInputElement> = (e) => {
    const {onFocus} = this.props;
    if (onFocus) {
      onFocus(e);
    }
    this.toggleList(true);
  }

  onBlur: React.FormEventHandler<HTMLInputElement> = (e) => {
    const {onBlur} = this.props;
    if (onBlur) {
      onBlur(e);
    }
    this.hideList();
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {onKeyDown} = this.props;
    if (onKeyDown) {
      onKeyDown(e);
    }
    const {options, active} = this.state;
    const keyCode = e.keyCode;
    if (keyCode === 40) {
      const next = active + 1 >= options.length ? 0 : active + 1;
      this.setState({active: next});
    } else if (keyCode === 38) {
      const pre = active - 1 < 0 ? options.length - 1 : active - 1;
      this.setState({active: pre});
    }

    if (keyCode === 13) {
      this.onChangeTrigger(this.state.options[active]);
      this.hideList();
    } else {
      this.toggleList(true);
    }
  }

  onFilter = (value: string) => {
    const {onFilter, dataSource} = this.props;
    this.onChangeTrigger(value);

    if (onFilter) {
      const options = onFilter(value, dataSource);
      this.setState({options});
    } else {
      const options =  dataSource.filter((item) => {
        return String(item).match(new RegExp(value));
      });
      this.setState({options});
    }

  }

  getValue = () => {
    const {value} = this.props;
    return value !== undefined ? value : this.state.value;
  }

  onChangeTrigger = (value: any) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(value);
    }
    this.setState({value});
  }

  // 隐藏list
  hideList = () => {
    const {activeFirstOption} = this.props;
    if (activeFirstOption) {
      this.setState({active: 0});
    }

    this.toggleList(false);
  }

  toggleList = (show: boolean) => {
    if (this.listShowTimeout) {
      clearTimeout(this.listShowTimeout);
    }

    // 延时下拉框消失，否侧列表的子项click将不生效
    this.listShowTimeout = window.setTimeout(() => {
      this.setState({show});
    }, 100);
  }

  render() {
    const {
      className, style, dataSource,
      onFilter, value, onChange,
      activeFirstOption, ...otherProps
    } = this.props;
    const preCls = 'yoshino-auto-complete';
    const clsName = classNames(
      preCls, className,
    );
    const {options} = this.state;
    const inValue = this.getValue();
    const content = (
      <Expand
        active={this.state.show && options.length > 0}
      >
        <ul
          className={`${preCls}-list`}
        >
          {
            options.map((item, key) => {
              const {active} = this.state;
              const cls = classNames(
                `${preCls}-item`,
                {[`${preCls}-item-active`]: key === active},
              );
              return (
                <li
                  className={cls}
                  key={key}
                  onMouseOver={() => this.setState({active: key})}
                  onClick={() => {
                    this.onChangeTrigger(item);
                    this.hideList();
                  }}
                  onMouseDown={() => {
                    this.intervalHanlde = window.setInterval(() => {
                      this.refInput.focus();
                    }, 10);
                  }}
                  onMouseUp={() => {
                    clearInterval(this.intervalHanlde);
                  }}
                >
                  {item}
                </li>
              );
            })
          }
        </ul>
      </Expand>
    );
    return (
      <Pop
        content={content}
        inheritWidth
        placement='bottom'
        visible
      >
        <div
          className={clsName}
        >
          <Input
            {...otherProps}
            onFocus={this.onFocus}
            onBlur={this.hideList}
            onKeyDown={this.onKeyDown}
            onChange={this.onFilter}
            style={style}
            value={inValue}
            refInput={(v) => {
              if (v) {
                this.refInput = v;
              }
            }}
          />
        </div>
      </Pop>
    );
  }
}

export default AutoComplete;
