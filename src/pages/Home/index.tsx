import { Empty} from 'antd';
import styles from './home.module.scss'

const HomePage = () => {
    return (
        <div className={styles.home}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        </div>
    );
};

export default HomePage;
