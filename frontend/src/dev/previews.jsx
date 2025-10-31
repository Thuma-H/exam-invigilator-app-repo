import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import AttendancePage from "../pages/AttendancePage";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/AttendancePage">
                <AttendancePage/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews