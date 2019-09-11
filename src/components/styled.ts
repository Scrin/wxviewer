import styled from "styled-components";
import ReactSelect from "react-select";

export const OptionContainer = styled.div`
    margin: 0 8px;
    float: left;
`

export const CheckboxContainer = styled(OptionContainer)`
    margin-right: 0;
`

export const TextContainer = styled.span`
    display: block;
    padding: 9px;
    font-size: 1rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938rem;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
`

export const Select = styled(ReactSelect)`
    width: ${props => props.width}px;
`
