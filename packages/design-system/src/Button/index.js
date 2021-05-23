import React from 'react'
import T from 'prop-types'
import classNames from 'classnames'

import style from './button.module.scss'

const Button = ({ text, onClick, variant, className, color, size }) => (
  <button
    className={classNames(
      style.root,
      style[variant],
      style[color],
      style[size],
      className
    )}
    onClick={onClick}>
    {text}
  </button>
)

Button.propTypes = {
  onClick: T.func.isRequired,
  className: T.string,
  text: T.string.isRequired,
  variant: T.string,
  color: T.oneOf(['primary', 'secondary']),
  size: T.oneOf(['small', 'medium', 'large']),
}

Button.defaultProps = {
  variant: 'default',
  color: 'primary',
  size: 'medium',
}

export default Button