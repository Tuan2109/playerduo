import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, CardItem, Text, Icon, Right, Body, Container } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { arrayToString, objectToString } from './ManageAction/ExternalHelper'

import { getDefine } from '../components/ManageAction/ThTConfig'

export default class ThTCardItem extends Component {
    constructor(props) {
        super(props);
    }

    _validType = () => {
        if (this.props.text) {
            if (Array.isArray(this.props.text))
                return "array";
            else if (typeof this.props.text == "object")
                return "object";
            else
                return "string";
        }
        return "Nothing";
    }

    _renderText = () => {
        let text = "";
        switch (this._validType()) {
            case "array":
                text = arrayToString(this.props.text);
                break;
            case "object":
                text = objectToString(this.props.text);
                break;
            case "string":
                text = this.props.text;
                break;
        }
        return (
            <Text>{text != "" ? text : null}</Text>
        )
    }

    render() {
        return (
            <View>
                <Text style={[{ color: 'red', fontSize: 20 }, this.props.titleStyle]}>{this.props.title}</Text>
                <Card style={this.props.cardContainerStlye}>
                    <CardItem style={[{ backgroundColor: getDefine().MAIN_COLOR }, this.props.cardStyle]} >
                        {this.props.iconName ? <Icon active name={this.props.iconName} /> : null}
                        {
                            this._renderText()
                        }
                        {this.props.iconName ? <Right><Icon name="arrow-forward" /></Right> : null}
                    </CardItem>
                </Card>
            </View>
        )
    }
}