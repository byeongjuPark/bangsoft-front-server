import React from 'react';
import './style.css';

// component: footer
export default function Footer() {

    // event handler : process icon button click event
    const onGithubIconButtonClickEventHandler = () => {
        window.open('https://github.com/byeongjuPark');
    }
    const onVelogIconButtonClickEventHandler = () => {
        window.open('https://velog.io/@bottlepark');
    }

    // render
    // insta -> github
    // blog -> velog
  return (
    <div id='footer'>
        <div className='footer-container'>
            <div className='footer-top'>
                <div className='footer-logo-box'>
                    <div className='icon-box'>
                        <div className='icon logo-light-icon'></div>
                    </div>
                    <div className='footer-logo-text'>{'Bangsoft'}</div>
                </div>
                <div className='footer-link-box'>
                    <div className='footer-email-link'>{'bottlepark28@gmail.com'}</div>
                    <div className='icon-button' onClick={onVelogIconButtonClickEventHandler}>
                        <div className='icon velog-icon'></div>
                    </div>
                    <div className='icon-button' onClick={onGithubIconButtonClickEventHandler}>
                        <div className='icon github-mark-white-icon'></div>
                    </div>
                </div>
            </div>
            <div className='footer-bottom'>
                <div className='footer-copyright'>{'Copyright ⓒ Bangsoft. All Rights Reserved.'}</div>
            </div>
        </div> 
    </div>
  )
}
