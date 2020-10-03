
import { Component, CSSProperties, ReactNode } from 'react';
import * as React from 'react';
import * as classNames from 'classnames';
import {IBaseComponent} from '../template/component';
import Icon from '../Icon';

export interface ICarouselProps extends IBaseComponent {
  /**
   * 自动滚动
   */
  autoplay?: boolean;
  /**
   * 切换时间间隔
   */
  interval?: number;
  /**
   * 是否显示指示点
   */
  shwoDots?: boolean;
  /**
   * 垂直展示
   */
  vertical?: boolean;
  /**
   * 是否显示轮播控制器
   */
  showControl?: boolean;
  /**
   * 往前翻icon
   */
  preIcon?: ReactNode;
  /**
   * 往下翻icon
   */
  nextIcon?: ReactNode;
}

export interface ICarouselState {
  activeIndex: number;
  containerWidth: number;
  containerHeight: number;
}

/**
 * **组件中文名称**-组件描述。
 */
export class Carousel extends Component<ICarouselProps, ICarouselState> {
  preCls = 'yoshino-carousel';
  intervalHandle: number;
  timeoutHandle: number;

  refContainer: HTMLElement;
  refList?: HTMLElement;

  jumpSwitch: boolean = true;

  componentDidMount() {
    this.setAutoplayInterval();

    this.setContainerBound();

    document.body.addEventListener('resize', this.setContainerBound);
  }

  UNSAFE_componentWillMount() {
    document.body.removeEventListener('resize', this.setContainerBound);
  }

  setContainerBound = () => {
    this.setState({
      containerWidth: this.refContainer.clientWidth,
      containerHeight: this.refContainer.clientHeight,
    });
  }

  static defaultProps = {
    autoplay: true,
    interval: 3000,
    vertical: false,
    shwoDots: true,
    showControl: true,
  };

  state = {
    activeIndex: 1,
    containerWidth: 0,
    containerHeight: 0,
  };

  setAutoplayInterval = () => {
    const {interval, autoplay} = this.props;
    if (!autoplay) {
      return;
    }
    this.intervalHandle = setInterval(() => {
      this.next();
    }, interval);
  }

  getIndex = (step: number) => {
    const {activeIndex} = this.state;
    const {children} = this.props;
    const child = React.Children.toArray(children);
    const length =  child.length + 2;
    if (step > 0) {
      return activeIndex + step >= length ? step - 1 : activeIndex + step;
    }

    if (step < 0) {
      return activeIndex + step < 0 ? length + step : activeIndex + step;
    }
    return activeIndex;
  }

  goto = (index: number) => {
    if (!this.jumpSwitch) {
      return;
    }
    this.jumpSwitch = false;

    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.setState({
      activeIndex: index,
    }, () => {
      this.setAutoplayInterval();
    });
  }

  next = () => {
    this.goto(this.getIndex(1));
  }

  pre = () => {
    this.goto(this.getIndex(-1));
  }

  renderChild = () => {
    const {children, vertical} = this.props;
    const child = React.Children.toArray(children);

    // 首尾各补一个child，保证循环滚动不间断
    child.unshift(child[child.length - 1]);
    child.push(child[1]);

    const width = this.state.containerWidth;
    const height = this.state.containerHeight;
    const childSum = child.length;
    const {activeIndex} = this.state;
    const offset =  (vertical ? height : width ) * activeIndex;

    const listStyle: CSSProperties = {
      width: vertical ? width : width * childSum,
      height: vertical ? height * childSum : height,
      transform: vertical ? `translateY(-${offset}px)` : `translateX(-${offset}px)`,
    };

    if (this.refList) {
      this.refList.style.transition = 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)';

      this.timeoutHandle = window.setTimeout(() => {
        const first = 1;
        const last = childSum - 2;
        if (this.timeoutHandle) {
          clearTimeout(this.timeoutHandle);
        }
        if (activeIndex === 0) {
          this.setState({activeIndex: last});
        }
        if (activeIndex === childSum - 1) {
          this.setState({activeIndex: first});
        }
        if (this.refList) {
          this.refList.style.transition = null;
        }
        this.jumpSwitch = true;
      }, 300);
    }

    return (
      <div
        style={listStyle}
        className={`${this.preCls}-list`}
        ref={(v) => {
          if (v) {
            this.refList = v;
          }
        }}
      >
        {
          React.Children.map(child, (item: JSX.Element, index) => {
            const itemStyle: CSSProperties = {
              width,
              height,
            };
            return (
              <div key={index} className={`${this.preCls}-child`} style={itemStyle}>
                {item}
              </div>
            );
          })
        }
      </div>
    );
  }

  renderControl = () => {
    const {vertical, preIcon, nextIcon} = this.props;
    const preCls = this.preCls;
    const preIconType = vertical ? 'ios-arrow-up' : 'ios-arrow-back';
    const nextIconType = vertical ? 'ios-arrow-down' : 'ios-arrow-forward';
    return (
      <React.Fragment>
        <div
          className={`${preCls}-btn ${preCls}-btn-pre`}
          onClick={this.pre}
        >
          {preIcon || <Icon type={preIconType}/>}
        </div>
        <div
          className={`${preCls}-btn ${preCls}-btn-next`}
          onClick={this.next}
        >
          {nextIcon || <Icon type={nextIconType}/>}
        </div>
      </React.Fragment>
    );
  }

  renderDots = () => {
    const preCls = this.preCls;
    const {children} = this.props;
    const {activeIndex} = this.state;
    const child = React.Children.toArray(children);
    const renderDot = () => {
      const first = 1;
      const last = child.length + 1;
      const jsx = [];
      for (let i = first; i < last; i++) {
        let active = activeIndex;
        if (activeIndex === 0) {
          active = child.length;
        }
        if (activeIndex === last) {
          active = 1;
        }
        const cls = classNames(
          `${preCls}-dot`,
          {
            [`${preCls}-active-dot`]: active === i,
          }
        );

        jsx.push(
          <div
            className={cls}
            key={i}
            onClick={() => this.goto(i)}
          />
        );
      }
      return jsx;
    };

    return (
      <div className={`${preCls}-dots-box`}>
        {renderDot()}
      </div>
    );
  }

  render() {
    const {
      className, style, autoplay, showControl,
      shwoDots, interval, vertical, children,
      preIcon, nextIcon,
      ...otherProps} = this.props;
    const preCls = this.preCls;
    const clsName = classNames(
      preCls, className,
      {
        [`${preCls}-vertical`]: vertical,
        [`${preCls}-horizontal`]: !vertical,
      },
    );

    return (
      <div
        className={clsName}
        style={style}
        {...otherProps}
        ref={(v) => {
          if (v) {
            this.refContainer = v;
          }
        }}
      >
        {this.state.containerWidth ? this.renderChild() : null}
        {showControl ? this.renderControl() : null}
        {shwoDots ? this.renderDots() : null}
      </div>
    );
  }
}

export default Carousel;
