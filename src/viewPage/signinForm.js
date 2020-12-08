import React from 'react'
import { useForm } from 'react-hook-form';
import {convert1dTo2dArray, subtract} from './utils'

export default function SigninForm({ meetingData, setMeetingData, setUserData }) {

    const { register, handleSubmit } = useForm()

    function onSubmit(userInfo) {

        let data = {
            name: userInfo.username,
            password: userInfo.password === "" ? null : userInfo.password,
        }

        fetch('/api/people/' + meetingData.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            console.log('raw server login response: ', res)
            return res.status === 404 ? res : res.json()
        })
        .then(data => {
            console.log("processed login data", data)
            if(data == null) console.log("null res")
            else if(data.status !== undefined || data.value !== undefined) {
                console.log(data.status, data.statusText, data.value)
            }
            else {
                data.available = convert1dTo2dArray([...data.available], meetingData.numTimeslots, meetingData.numDays)
                meetingData.availableCount = subtract(meetingData.availableCount, data.available)
                
                setUserData(data)
                setMeetingData(meetingData)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input type="text" placeholder="username" name="username" ref={register({required: true, minLength:1, maxLength:20})}/>
            <input type="password" placeholder="password" name="password" ref={register({required: false, maxLength:20})} />
            <input type="submit" value="Login" />
        </form>
    )
}
