import React from 'react';
import { Drawer } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../types";
import { showDrawer } from "../redux/actions";
import PassSelector from './PassSelector';
import EnhancementSelector from './EnhancementSelector';
import EnhancementOptions from './EnhancementOptions';
import { TextContainer } from './styled';
import { CloseMenu } from './MenuButton';

export default () => {
    const dispatch = useDispatch();
    const show = useSelector((state: State) => state.ui.showDrawer);

    return (
        <Drawer open={show} onClose={() => dispatch(showDrawer(false))}>
            <TextContainer>Select satellite pass</TextContainer>
            <PassSelector />
            <TextContainer>Select enhancement</TextContainer>
            <EnhancementSelector />
            <TextContainer>Additional options</TextContainer>
            <EnhancementOptions />
            <CloseMenu />
        </Drawer>
    );
}
