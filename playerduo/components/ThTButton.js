import React, { Component } from 'react'
import { Text, StyleSheet } from 'react-native';
import { Button } from 'native-base'

export default class ThTButton extends Component {
    static defaultProps = {
        text: "Name button"
    }

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Button
                rounded
                info
                style={[styles.buttonContainer, { backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : '#0AFAD5' }]}
                onPress={() => { this.props.onPress ? this.props.onPress() : null }}
            >
                <Text style={styles.buttonText}>{this.props.text}</Text>
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        height: 60,
        marginVertical: 5,
        marginRight: 30,
        marginLeft: 30,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700'
    }
});