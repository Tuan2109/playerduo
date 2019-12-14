import React, { Component } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import LoginForm from '../components/ManageAction/LoginForm'

export default class RegisterScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require('../assets/images/logo.png')}
                    />
                    <Text style={styles.title}>
                        'WE' are the best
                    </Text>
                </View>
                <View style={styles.formContainer}>
                    <LoginForm navigation={this.props.navigation} btnText="Đăng ký"/>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 120,
        height: 120
    },
    title: {
        marginTop: 10,
        color: '#ff4405',
        fontSize: 20,
        textAlign: 'center',
        opacity: 0.9
    },
    formContainer: {
        flex: 0.3
    }
})