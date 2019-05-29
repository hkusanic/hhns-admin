import React, { Component } from 'react'
import Sidebar from './Sidebar'
import BasicProfile from './BasicProfile'
import DiscipleProfile from './DiscipleProfile'
import SadhanaSheets from './SadhanaSheets'
import Reports from './Reports'

class UsersProfile extends Component {
  render() {
    const { location } = this.props
    const dummyData = {
      oldData: {
        vid: '17356',
        nid: '17353',
        uid: '81',
        init: 'divakar@rayapaty.com',
        picture: null,
        path: 'https://www.niranjanaswami.net/en/rest/user/81',
      },
      disciple_profile: {
        first_initiation_date: '2010-12-10 00:00:00',
        second_initiation_date: '2013-12-22 00:00:00',
        spiritual_name: 'Dina Gauranga dasa',
        temple: 'East Hartford',
        verifier: '',
        marital_status: 'married',
        education: 'other',
      },
      name: {
        first: 'Divakar',
        last: 'Rayapaty',
      },
      gender: 'male',
      mobileNumber: '+1-203-918-3034',
      dob: '1975-03-21 00:00:00',
      userName: 'Dina Gauranga',
      email: 'dgd.nrs@gmail.com',
      timezone: 'America/New_York',
      language: 'en',
      created: '1191363651',
      access: '1559039170',
      login: '1559020083',
      signature: '',
      signature_format: '3',
      canAccessKeystone: false,
      user_id: 'd995be95-d583-4508-a35c-14ab53ab3527',
    }

    let content
    if (location.pathname === '/users/profile/basic') {
      content = <BasicProfile data={dummyData} />
    }

    if (location.pathname === '/users/profile/disciple') {
      content = <DiscipleProfile data={dummyData} />
    }

    if (location.pathname === '/users/profile/sadhana') {
      content = <SadhanaSheets data={dummyData} />
    }

    if (location.pathname === '/users/profile/reports') {
      content = <Reports data={dummyData} />
    }

    return (
      <div>
        <Sidebar>{content}</Sidebar>
      </div>
    )
  }
}

export default UsersProfile
