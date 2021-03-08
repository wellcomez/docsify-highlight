import { registComponet } from './mountCmp';
import { Button,Table,Tree ,Notification} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
export const elementLoader = () => {
    registComponet({ Button,Table,Tree ,Notification});
}
