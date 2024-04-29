import React, { useState, KeyboardEvent, useRef, ChangeEvent, useEffect } from 'react'
import './style.css'
import InputBox from 'components/InputBox';
import { SignInRequestDto, SignUpRequestDto } from 'apis/request/auth';
import { signInRequest, signUpRequest } from 'apis';
import { SignInResponseDto, SignUpResponseDto } from 'apis/response/auth';
import { ResponseDto } from 'apis/response';
import { useCookies } from 'react-cookie';
import { MAIN_PATH } from 'constant';
import { useNavigate } from 'react-router-dom';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';

// component : 인증화면
export default function Authentication() {

  // state : 화면 상태
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  // state : 쿠키 상태
  const [cookies, setCookie] = useCookies();

  // function : navigate
  const navigator = useNavigate();

  //component : sign in card
  const SignInCard = () => {

    // state : 입력 상태
    const [email, setEmail] = useState<string>('');
    const emailRef = useRef<HTMLInputElement | null>(null);
    const [password, setPassword] = useState<string>('');
    const passwordRef = useRef<HTMLInputElement | null>(null);


    // state : 비밀번호 노출 여부 상태
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    // state : 패스워드 버튼 아이콘 상태
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    // state : 에러 상태
    const [error, setError] = useState<boolean>(false);


    // function 
    const signInResponse = (responseBody: SignInResponseDto | ResponseDto | null) => {
      if (!responseBody) {
        alert('네트워크 이상입니다.');
        return;
      }
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 오류입니다.')
      if (code === 'SF' || code === 'VF') setError(true);
      if (code !== 'SU') return;

      const { token, expirationTime } = responseBody as SignInResponseDto;
      const now = new Date().getTime();
      const expires = new Date(now + expirationTime * 1000);

      setCookie('accessToken', token, { expires, path: MAIN_PATH() });
      navigator(MAIN_PATH());


    }

    // event handler : 이메일 변경 이벤트 처리
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setEmail(value);
    }
    // event handler : 비밀번호 변경 이벤트 처리
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setError(false);
      const { value } = event.target;
      setPassword(value);
    }

    // event handler : 로그인 버튼 클릭 이벤트 처리
    const onSignInButtonClickHandler = () => {
      const requestBody: SignInRequestDto = { email, password }
      signInRequest(requestBody).then(signInResponse);
    }
    // event handler : 회원가입 버튼 클릭 이벤트 처리
    const onSignUpButtonClickHandler = () => {
      setView('sign-up');
    }

    // event handler : 패스워드 버튼 클릭 이벤트 처리
    const onPasswordButtonClickHandler = () => {
      if (passwordType === 'text') {
        setPasswordType('password');
        setPasswordButtonIcon('eye-light-off-icon');
      } else {
        setPasswordType('text');
        setPasswordButtonIcon('eye-light-on-icon');
      }
    }

    // event handler : 이메일 인풋 키 다운 이벤트 처리
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
    }

    // event handler :패스워드 인풋 키 다운 이벤트 처리
    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onPasswordButtonClickHandler();
    }



    // render
    return (
      <div className='auth-card'>
        <div className='auth-card-box'>
          <div className='auth-card-top'>
            <div className='auth-card-title-box'>
              <div className='auth-card-title'>{'로그인'}</div>
            </div>
            <InputBox ref={emailRef}
              label={'이메일 주소'}
              type={'text'}
              placeholder={'이메일 주소를 입력해주세요.'}
              error={error}
              value={email}
              onChange={onEmailChangeHandler}
              onKeyDown={onEmailKeyDownHandler}
            />
            <InputBox
              ref={passwordRef}
              label={'패스워드'}
              type={passwordType}
              placeholder='비밀번호를 입력해주세요.'
              error={error}
              value={password}
              onChange={onPasswordChangeHandler}
              icon={passwordButtonIcon}
              onButtonClick={onPasswordButtonClickHandler}
              onKeyDown={onPasswordKeyDownHandler}
            />
          </div>
          <div className='auth-card-bottom'>
            {error &&
              <div className='auth-sign-in-error-box'>
                <div className='auth-sign-in-error-message'>
                  {'이메일 주소 또는 비밀번호를 잘못 입력했습니다. \n입력하신 내용을 다시 확인해주세요.'}
                </div>
              </div>
            }
            <div className='black-large-full-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
            <div className='auth-description-box'>
              <div className='auth-description'>
                {'신규 사용자이신가요? '}<span className='auth-description-link' onClick={onSignUpButtonClickHandler}>{'회원가입'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



  //component : sign up card
  const SignUpCard = () => {

    // state : 이메일, 패스워드, 패스워드 확인 요소 참조 상태
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const passwordCheckRef = useRef<HTMLInputElement | null>(null);

    const nicknameRef = useRef<HTMLInputElement | null>(null);
    const telNumberRef = useRef<HTMLInputElement | null>(null);
    const addressRef = useRef<HTMLInputElement | null>(null);
    const addressDetailRef = useRef<HTMLInputElement | null>(null);


    // state : 페이지 번호 상태
    const [page, setPage] = useState<1 | 2>(1);

    // state : 이메일, 패스워드, 패스워드 확인 상태
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordCheck, setPasswordCheck] = useState<string>('');

    // state 패스워드, 패스워드 확인 타입 상태
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    const [passwordCheckType, setPasswordCheckType] = useState<'text' | 'password'>('password');

    const [nickname, setNickname] = useState<string>('');
    const [telNumber, setTelNumber] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressDetail, setAddressDetatil] = useState<string>('');
    const [agreedPersonal, setAgreedPersonal] = useState<boolean>(false);



    // state : 에러 상태
    const [isEmailError, setEmailError] = useState<boolean>(false);
    const [isPasswordError, setPasswordError] = useState<boolean>(false);
    const [isPasswordCheckError, setPasswordCheckError] = useState<boolean>(false);

    // state : 에러 상태 2
    const [isNicknameError, setNicknameError] = useState<boolean>(false);
    const [isTelNumberError, setTelNumberError] = useState<boolean>(false);
    const [isAddressError, setAddressError] = useState<boolean>(false);
    const [isAgreedPersonalError, setAgreedPersonalError] = useState<boolean>(false);

    // state : 에러 메세지 상태
    const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');
    const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');

    const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');
    const [telNumberErrorMessage, setTelNumberErrorMessage] = useState<string>('');
    const [addressErrorMessage, setAddressErrorMessage] = useState<string>('');


    // state : 패스워드 버튼 아이콘 상태
    const [passwordButtonIcon, setPasswordButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');
    const [passwordCheckButtonIcon, setPasswordCheckButtonIcon] = useState<'eye-light-off-icon' | 'eye-light-on-icon'>('eye-light-off-icon');

    // function : 다음 주소 검색 팝업 오픈 함수
    const open = useDaumPostcodePopup();

    // function : Sign up response 처리 함수
    const signUpResponse = (responseBody: SignUpResponseDto | ResponseDto | null) => {
      if (!responseBody) {
        alert('네트워크 이상입니다.');
        return;
      }
      const { code } = responseBody;
      if(code === 'DE'){
        setPage(1);
        setEmailError(true);
        setEmailErrorMessage('중복되는 이메일 주소입니다.');
      }
      if(code === 'DN'){
        setNicknameError(true);
        setNicknameErrorMessage('중복되는 닉네임입니다.');
      }
      if(code === 'DT'){
        setTelNumberError(true);
        setTelNumberErrorMessage('중복되는 핸드폰 번호입니다.');
      }
      if(code === 'VF') alert('모든 값을 입력하세요.');
      if(code === 'DBE') alert('데이터베이스 오류입니다.');
      
      if(code !== 'SU') return;

      setView('sign-in');
      
    }

    // event handler : 입력 변경 이벤트 처리
    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setEmail(value);
      setEmailError(false);
      setEmailErrorMessage('');
    }
    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPassword(value);
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    const onPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setPasswordCheck(value);
      setPasswordCheckError(false);
      setPasswordCheckErrorMessage('');
    }

    // event handler : page 2 입력 변경 이벤트
    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setNickname(value);
      setNicknameError(false);
      setNicknameErrorMessage('');
    }
    const onTelNumberChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setTelNumber(value);
      setTelNumberError(false);
      setTelNumberErrorMessage('');
    }
    const onAddressChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setAddress(value);
      setAddressError(false);
      setAddressErrorMessage('');
    }
    const onAddressDetailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setAddressDetatil(value);
    }

    const onAgreedPersonalClickHandler = () => {
      setAgreedPersonal(!agreedPersonal)
      setAgreedPersonalError(false);
    }

    // event handler : 패스워드 버튼 클릭 이벤트 처리
    const onPasswordButtonClickHandler = () => {
      if (passwordType === 'text') {
        setPasswordType('password');
        setPasswordButtonIcon('eye-light-off-icon');
      } else {
        setPasswordType('text');
        setPasswordButtonIcon('eye-light-on-icon');
      }
    }
    const onPasswordCheckButtonClickHandler = () => {
      if (passwordCheckType === 'text') {
        setPasswordCheckType('password');
        setPasswordCheckButtonIcon('eye-light-off-icon');
      } else {
        setPasswordCheckType('text');
        setPasswordCheckButtonIcon('eye-light-on-icon');
      }
    }

    // event handler : 주소 버튼 클릭 이벤트 처리
    const onAddressButtonClickHandler = () => {
      open({ onComplete });
    }

    // event handler : 다음 단계 버튼 클릭 이벤트 처리
    const onNextButtonClickHandler = () => {
      const emailPattern = /^[a-zA-z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
      const isEmailPattern = emailPattern.test(email);
      if (!isEmailPattern) {
        setEmailError(true);
        setEmailErrorMessage('이메일 주소 포맷이 맞지 않습니다.');
      }
      const isCheckPassword = password.trim().length >= 8;
      if (!isCheckPassword) {
        setPasswordError(true);
        setPasswordErrorMessage('비밀번호는 8자 이상 입력해주세요.')
      }

      const isEqualPassword = password === passwordCheck;
      if (!isEqualPassword) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage('비밀번호가 일치하지않습니다.');
      }
      if (!isEmailPattern || !isCheckPassword || !isEqualPassword) return;
        setPage(2);
        
      
    }

    // event handler : 링크 클릭 이벤트 처리
    const onSignInLinkClickHandler = () => {
      setView('sign-in');
    }

    const onSignUpButtonClickHandler = () => {
      const emailPattern = /^[a-zA-z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
      const isEmailPattern = emailPattern.test(email);
      if (!isEmailPattern) {
        setEmailError(true);
        setEmailErrorMessage('이메일 주소 포맷이 맞지 않습니다.');
      }
      const isCheckPassword = password.trim().length >= 8;
      if (!isCheckPassword) {
        setPasswordError(true);
        setPasswordErrorMessage('비밀번호는 8자 이상 입력해주세요.');
      }

      const isEqualPassword = password === passwordCheck;
      if (!isEqualPassword) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage('비밀번호가 일치하지않습니다.');
      }

      if (!isEmailPattern || !isCheckPassword || !isEqualPassword) {
        setPage(1);
        return;
      }
      const hasNickname = nickname.length !== 0;
      if (!hasNickname) {
        setNicknameError(true);
        setNicknameErrorMessage('닉네임을 입력해주세요.');
      }
      const telNumberPattern = /^[0-9]{11,13}$/;
      const isTelNumberPattern = telNumberPattern.test(telNumber);
      if (!isTelNumberPattern) {
        setTelNumberError(true);
        setTelNumberErrorMessage('숫자만 입력해 주세요.');
      }
      const hasAddress = address.trim().length > 0;
      if (!hasAddress) {
        setAddressError(true);
        setAddressErrorMessage('주소를 입력해주세요.');
      }

      if (!agreedPersonal) setAgreedPersonalError(true);

      if (!hasNickname || !isTelNumberPattern || !agreedPersonal) return;

      const requestBody: SignUpRequestDto = {
        email, password, nickname, telNumber, address, addressDetail, agreedPersonal
      };

      signUpRequest(requestBody).then(signUpResponse);
    }

    // event handler : 키 다운 이벤트 처리
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
    }
    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordCheckRef.current) return;
      passwordCheckRef.current.focus();
    }
    const onPasswordCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onNextButtonClickHandler();

      if (!nicknameRef.current) return;
      onNextButtonClickHandler();
      nicknameRef.current.focus();
    }
    const onNicknameCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!telNumberRef.current) return;
      telNumberRef.current.focus();
    }
    const onTelNumberCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onAddressButtonClickHandler();
    }
    const onAddressCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!addressDetailRef.current) return;
      addressDetailRef.current.focus();
    }
    const onAddressDetailCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onSignUpButtonClickHandler();
    }


    // event handler : 다음 주소 검색 완료 이벤트 처리
    const onComplete = (data: Address) => {
      const { address } = data;
      setAddress(address);
      if (!addressDetailRef.current) return;
      addressDetailRef.current.focus();
    }
    // effect : 페이지 변경시 실행 
    useEffect(() => {
      if (page === 2) { 
        if(!nicknameRef.current) return;
        nicknameRef.current.focus();
      }
    }, [page])
    

    // render
    return (
      <div className='auth-card'>
        <div className='auth-card-box'>
          <div className='auth-card-top'>
            <div className='auth-card-title-box'>
              <div className='auth-card-title'>{'회원가입'}</div>
              <div className='auth-card-page'>{`${page}/2`}</div>
            </div>

            {page === 1 && (
              <>
                <InputBox
                  ref={emailRef}
                  label='이메일 주소*'
                  type='text'
                  placeholder='이메일 주소를 입력해 주세요.'
                  value={email}
                  onChange={onEmailChangeHandler}
                  error={isEmailError}
                  message={emailErrorMessage}
                  onKeyDown={onEmailKeyDownHandler}
                />
                <InputBox
                  ref={passwordRef}
                  label='비밀번호*'
                  type={passwordType}
                  placeholder='비밀번호를 입력해 주세요.'
                  value={password}
                  onChange={onPasswordChangeHandler}
                  error={isPasswordError}
                  message={passwordErrorMessage}
                  icon={passwordButtonIcon}
                  onButtonClick={onPasswordButtonClickHandler}
                  onKeyDown={onPasswordKeyDownHandler}
                />
                <InputBox
                  ref={passwordCheckRef}
                  label='비밀번호 확인*'
                  type={passwordCheckType}
                  placeholder='비밀번호를 다시 입력해 주세요.'
                  value={passwordCheck}
                  onChange={onPasswordCheckChangeHandler}
                  error={isPasswordCheckError}
                  message={passwordCheckErrorMessage}
                  icon={passwordCheckButtonIcon}
                  onButtonClick={onPasswordCheckButtonClickHandler}
                  onKeyDown={onPasswordCheckKeyDownHandler}
                />
              </>
            )}

            {page === 2 && (
              <>
                <InputBox ref={nicknameRef} label='닉네임*' type='text' placeholder='닉네임을 입력해주세요.' value={nickname} onChange={onNicknameChangeHandler} error={isNicknameError} message={nicknameErrorMessage} onKeyDown={onNicknameCheckKeyDownHandler} />
                <InputBox ref={telNumberRef} label='핸드폰 번호*' type='text' placeholder='핸드폰 번호를 입력해주세요.' value={telNumber} onChange={onTelNumberChangeHandler} error={isTelNumberError} message={telNumberErrorMessage} onKeyDown={onTelNumberCheckKeyDownHandler} />
                <InputBox ref={addressRef} label='주소*' type='text' placeholder='주소 찾기' value={address} onChange={onAddressChangeHandler} error={isAddressError} message={addressErrorMessage} icon='expand-right-light-icon' onButtonClick={onAddressButtonClickHandler} onKeyDown={onAddressCheckKeyDownHandler} />
                <InputBox ref={addressDetailRef} label='상세 주소' type='text' placeholder='상세 주소를 입력해주세요.' value={addressDetail} onChange={onAddressDetailChangeHandler} error={false} onKeyDown={onAddressDetailCheckKeyDownHandler} />
              </>
            )}

          </div>
          <div className='auth-card-bottom'>
            {page === 1 && (
              <div className='black-large-full-button' onClick={onNextButtonClickHandler}>{'다음 단계'}</div>
            )}
            {page === 2 && (
              <>
                <div className='auth-consent-box'>
                  <div className='auth-check-box' onClick={onAgreedPersonalClickHandler}>
                    <div className={`icon ${agreedPersonal ? 'check-round-fill-icon' : 'check-ring-light-icon'}`}></div>

                  </div>
                  <div className={isAgreedPersonalError ? 'auth-consent-title-error' : 'auth-consent-title'}>{'개인정보동의'}</div>
                  <div className='auth-consent-link'>{'더보기> '}</div>
                </div>
                <div className='black-large-full-button' onClick={onSignUpButtonClickHandler}>{'다음 단계'}</div>

              </>
            )}
            <div className='auth-description-box'>
              <div className='auth-description'>{'이미 계정이 있으신가요? '}<span className='auth-description-link' onClick={onSignInLinkClickHandler}>{'로그인'}</span></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // event handler
  // render
  return (
    <div id='auth-wrapper'>
      <div className='auth-container'>
        <div className='auth-jumbotron-box'>
          <div className='auth-jumbotron-contents'>
            <div className='auth-logo-icon'></div>
            <div className='auth-jumbotron-text-box'>
              <div className='auth-jumbotron-text'>{'환영합니다.'}</div>
              <div className='auth-jumbotron-text'>{'Bangsoft 입니다.'}</div>
            </div>
          </div>
        </div>
        {view === 'sign-in' && <SignInCard />}
        {view === 'sign-up' && <SignUpCard />}
      </div>
    </div>
  )
}

