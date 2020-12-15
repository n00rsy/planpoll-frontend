import React, { useState, useMemo, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap'

import TableDragSelect from "./table";
import MemoizedTimeTable from "./timeTable"
import { convert2dTo1dArray } from './utils'
import GroupAvailable from './groupAvailable'
import Legend from './legend'

import edit from '../img/edit.png'
import view from '../img/view.png'
import './styles.css'

export default function AvailabilityTable({ meetingData, userData, setUserData, getMeeting }) {

    const [saving, setSaving] = useState(false)
    const [currentCoords, setCurrentCoords] = useState(null)
    const [editing, setEditing] = useState(userData !== null)

    let handleChange = cells => {
        //console.log("new cells: ", cells)
        setUserData({ ...userData, available: cells });
    }

    useEffect(() => {
        if (userData === null) setEditing(false)
        else setEditing(true)
    }, [userData])

    function save() {
        setSaving(true)
        let data = {
            name: userData.name,
            available: convert2dTo1dArray(userData.available)
        }
        console.log("saving changes!", data, meetingData.id)
        fetch('/api/people/' + meetingData.id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .catch(err => {
                console.log("fetch error!", err)
                setSaving(false)
            })
            .then(res => {
                setSaving(false)
                console.log('raw server response: ', res)
                if (res.status === 204) {
                    getMeeting('/' + meetingData.id)
                    return true
                }
                return false
            })

    }

    function toggleEditing() {
        console.log("toggling editing!")
        setEditing(!editing)
    }

    function generateTableCells(numTimeslots, numDays) {
        console.log("generating raw table rows and cols!!!")
        let table = []
        for (let time = 0; time < numTimeslots; time++) {
            let currRow = []
            for (let day = 0; day < numDays; day++) {
                currRow.push(<td key={day}></td>)
            }
            table.push(<tr key={time}>{currRow}</tr>)
        }
        return table
    }

    let startingMoment = meetingData.surveyUsing === "Dates" ? meetingData.localTimes[0].format("H") : meetingData.startTime
    const table = useMemo(() => generateTableCells(meetingData.numTimeslots, meetingData.numDays), [meetingData.numTimeslots, meetingData.numDays])
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col>
                        {meetingData.numRespondents > 0 && <Legend numRespondents={meetingData.numRespondents} />}
                    </Col>
                    <Col>
                        <div className="container">
                        <button className="toggle-button"
                            onClick={toggleEditing} disabled={!userData}><img style={{ width: "1.5rem", height: "auto" }} src={editing ? view : edit}></img></button>
                            <MemoizedTimeTable startingMoment={startingMoment} numTimeslots={meetingData.numTimeslots} surveyUsing={meetingData.surveyUsing} />
                            <TableDragSelect
                                value={userData === null ? null : userData.available}
                                onChange={handleChange}
                                days={meetingData.surveyUsing === "Dates" ? meetingData.localTimes : meetingData.days}
                                colors={meetingData.colors}
                                setCurrentCoords={setCurrentCoords}
                                currentCoords={currentCoords}
                                editing={editing}>
                                {table}
                            </TableDragSelect>

                        </div>
                        {userData && <button style={{ marginTop: "2rem" }} className="button-important" value="Save" onClick={save}>{saving ? "SAVING..." : " Save Response"}</button>}
                    </Col>
                    <Col>
                        <GroupAvailable
                            numRespondents={meetingData.numRespondents}
                            people={meetingData.people}
                            currentCoords={currentCoords}
                            moments={meetingData.surveyUsing === 'Dates' ? meetingData.localTimes : { days: meetingData.days, startTime: meetingData.startTime }}
                            surveyUsing={meetingData.surveyUsing} />
                    </Col>
                </Row>
            </Container>
            <div className="container-bottom">

            </div>
        </div>
    )
}
