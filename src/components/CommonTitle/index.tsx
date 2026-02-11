import React from 'react';
import styles from './title.module.scss'

interface CommonTitleProps {
  title: string;
  children?: React.ReactNode;
}

const CommonTitle = ({ title, children }: CommonTitleProps) => {
  return (
    <div className={styles.title}>
      <div className={styles.titleText}>{title}</div>
      <div className={styles.titleActions}>
        {children}
      </div>
    </div>
  );
};

export default CommonTitle;