import { Tabs, } from 'antd';

const CAMERA_IDS : string[] = [
    'Street',
    'Driveway',
    'Doorway',
    'Garden',
];

const CAMERA_URL : string = 'http://192.168.68.166:8888';

export const CamerasScreen = () => (
    <Tabs
        destroyOnHidden
        size='small'
        tabBarGutter={8}
        tabPosition='right'
        items={CAMERA_IDS.map(cameraId => ({
            key      : cameraId,
            label    : cameraId,
            children : (
                <iframe
                    style={{
                        minWidth  : 385,
                        minHeight : 270,
                    }}
                    src={`${CAMERA_URL}/${cameraId.toLowerCase()}`} />
            ),
        }))} />
);
