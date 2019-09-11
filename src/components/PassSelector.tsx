import React from 'react';
import { OptionContainer, Select } from './styled';
import { useSelector } from 'react-redux';
import { State, PassData } from '../types';
import { formatPass, passChange } from '../helpers';

export default () => {
    const passData = useSelector((state: State) => state.pass.passData);
    const passSelection = useSelector((state: State) => state.ui.passSelection);

    return (
        <OptionContainer>
            <Select
                width={360}
                options={Array.from(passData).reverse()}
                value={passData.find(p => p === passSelection.pass)}
                getOptionLabel={formatPass}
                getOptionValue={(o: any) => o}
                onChange={(p: PassData) => passChange(p)}
            />
        </OptionContainer>
    );
}
