'use client'
import React from 'react'
import { libraries, languages, otherTools } from './constants';

function Skills() {
    return (
        <div>
            <h2 className="text-3xl font-semibold mb-2">My Skills</h2>
            <h5 className="text-xl font-semibold mb-2">Languages</h5>
            <div className="flex mb-3">
                {
                    languages.map((skill) => (
                        <img className='mr-2' key={skill.name} src={skill.icon} width={50} title={skill.name} />
                    ))
                }
            </div>
            <h5 className="text-xl font-semibold mb-2">Libraries and frameworks</h5>
            <div className="flex mb-3">
                {
                    libraries.map((skill) => (
                        <img className='mr-2' key={skill.name} src={skill.icon} width={50} title={skill.name} />
                    ))
                }
            </div>

            <h5 className="text-xl font-semibold mb-2">Other tools</h5>
            <div className="flex mb-3">
                {
                    otherTools.map((skill) => (
                        <img className='mr-2' key={skill.name} src={skill.icon} width={50} title={skill.name} />
                    ))
                }
            </div>
        </div>
    )
}

export default Skills
