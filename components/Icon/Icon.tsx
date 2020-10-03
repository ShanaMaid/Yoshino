
import { Component } from 'react';
import * as React from 'react';
import * as classNames from 'classnames';
import {IBaseComponent} from '../template/component';
import Archer from 'archer-svgs';

export interface IIconProps extends IBaseComponent {
  /**
   * 图标名称
   */
  type?: string;
  /**
   * 渲染svg
   */
  svg?: string;
}

export interface IIconState {
  svgHtml: string;
}

const svgTarget = 'https://unpkg.com/ionicons@4.4.2/dist/ionicons/svg/';
const archer = new Archer();

/**
 * **图标**-展示对应的矢量化图标。
 */
export class Icon extends Component<IIconProps, IIconState> {
  state = {
    svgHtml: ''
  };

  getSvg = async (type: string) => {
    return await archer.fetchSvg(`${svgTarget}${type}.svg`);
  }

  async componentDidMount() {
    // 不使用ionicons图标时不进行加载，提高性能
    if (!this.props.type) {
      return;
    }

    // tslint:disable-next-line no-any
    const svg = await this.getSvg(this.props.type);
    this.setState({
      svgHtml: svg,
    });
  }

  async UNSAFE_componentWillReceiveProps(props: IIconProps) {
    if (!props.type) {
      return;
    }

    if (this.props.type !== props.type) {
      // tslint:disable-next-line no-any
      const svg = await this.getSvg(props.type);
      this.setState({
        svgHtml: svg,
      });
    }
  }

  render() {
    const {className, style, type, svg, ...otherProps} = this.props;
    const preCls = 'yoshino-icon';
    const clsName = classNames(
      preCls, className,
      {[`${preCls}-${type}`]: !!type}
    );
    return (
      <i
        className={clsName}
        style={style}
        dangerouslySetInnerHTML={{__html: svg || this.state.svgHtml}}
        {...otherProps}
      />
    );
  }
}

export default Icon;
