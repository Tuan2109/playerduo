import React, { Component } from 'react';
import { Content, Spinner, Container, Body } from 'native-base';
import { getDefine } from '../components/ManageAction/ThTConfig';
export default class WaitScreen extends Component {
    render() {
        return (
            <Container>
                <Body>
                    <Spinner color={getDefine().MAIN_COLOR} />
                </Body>
            </Container>
        );
    }
}