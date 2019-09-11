import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { State } from '../types';
import { OptionContainer, Select } from './styled';
import { formatEnhancementName, enhancementChange } from '../helpers';

export default () => {
    const passSelection = useSelector((state: State) => state.ui.passSelection);
    if (!passSelection.pass) return null;

    const enhancementOpts = _.uniq(passSelection.pass.enhancements.map(e => e.type));
    const opt = enhancementOpts.find(e => passSelection.enhancement && passSelection.enhancement.type === e);
    return (
        <OptionContainer>
            <Select
                width={360}
                options={enhancementOpts}
                value={[opt]}
                getOptionLabel={formatEnhancementName}
                getOptionValue={(o: any) => o}
                onChange={(e: string) => enhancementChange(e)}
            />
        </OptionContainer>
    )
}
