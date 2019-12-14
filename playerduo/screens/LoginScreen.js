import React, { Component } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';

import LoginForm from '../components/ManageAction/LoginForm'
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class Login extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
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
                    <LoginForm navigation={this.props.navigation} btnText="Đăng nhập" />
                    <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15 }}>Bạn là người mới?</Text>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Register')}>
                            <Text style={{ color: 'blue', fontSize: 15 }}> Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
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
        flex: 0.7
    }
})