import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Input, Item } from 'native-base'

export default class ThTTextInput extends Component {
    constructor(props) {
        super(props);
    }

    _onChangeText = (x) => {
        let stateName = this.props.stateName;
        if (this.props.updateState) return this.props.updateState(x, stateName);
        return null;
    }

    render() {
        return (
            <Item
                key={this.props.key}
                rounded
                style={styles.input}
            >
                <Input
                    placeholderTextColor='#C4C4C4'
                    style={styles.inputText}
                    onChangeText={(x) => this._onChangeText(x)}
                    value={this.props.value}
                    {...this.props}
                />
            </Item>
        )
    }
}

const styles = StyleSheet.create({
    input: {
        height: 60,
        backgroundColor: '#ECE9F6',
        marginVertical: 5,
        // marginHorizontal: 30,
        marginLeft: 30,
        marginRight: 30,
    },
    inputText: {
        color: '#736d6b',
        paddingHorizontal: 10,
        fontSize: 20,
    },
})