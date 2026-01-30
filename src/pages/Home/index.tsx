import {Button, Tooltip} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './home.module.scss'

const HomePage = () => {
    return (
        <div className={styles.home}>
            {/* <div className={styles.title}>首页</div> */}
            <Tooltip title="search">
                <Button type="primary" shape="circle" icon={<SearchOutlined />} />
            </Tooltip>
        </div>
    );
};

export default HomePage;
