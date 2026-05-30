import { containerStyle, cardStyle } from '../components/security-setup/constants';
import { useSecuritySetup, TOTAL_STEPS } from '../hooks/useSecuritySetup';
import { Step1AuthMethod } from '../components/security-setup/Step1AuthMethod';
import { Step2Password } from '../components/security-setup/Step2Password';
import { Step2Totp } from '../components/security-setup/Step2Totp';
import { Step3RecoveryPhrase } from '../components/security-setup/Step3RecoveryPhrase';
import { Step4ConfirmPhrase } from '../components/security-setup/Step4ConfirmPhrase';
import { Step5EmailVerification } from '../components/security-setup/Step5EmailVerification';
import { Step6Summary } from '../components/security-setup/Step6Summary';

export function SecuritySetup({
  onComplete,
  onCancel,
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const s = useSecuritySetup({ onComplete });

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ height: '4px', background: '#e2e8f0' }}>
          <div
            style={{
              height: '100%',
              background: '#2563eb',
              width: `${((s.step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div
          style={{
            padding: '0.875rem 2.25rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#94a3b8',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            Configuración de seguridad
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
            Paso {s.step} de {TOTAL_STEPS}
          </span>
        </div>

        {s.step === 1 && (
          <Step1AuthMethod
            authMethod={s.authMethod}
            onSelect={s.setAuthMethod}
            onContinue={() => s.setStep(2)}
            onCancel={onCancel}
          />
        )}
        {s.step === 2 && s.authMethod === 'password' && (
          <Step2Password
            password={s.password}
            password2={s.password2}
            showPassword={s.showPassword}
            error={s.error}
            onPasswordChange={s.onPasswordChange}
            onPassword2Change={s.onPassword2Change}
            onToggleShow={s.toggleShowPassword}
            canContinue={s.canContinueStep2()}
            onContinue={() => s.canContinueStep2() ? s.setStep(3) : s.setError('Revisa los campos antes de continuar.')}
            onBack={() => s.setStep(1)}
          />
        )}
        {s.step === 2 && s.authMethod === 'totp' && (
          <Step2Totp
            totpSecret={s.totpSecret}
            totpCopied={s.totpCopied}
            onCopy={s.handleCopyTotpSecret}
            totpVerified={s.totpVerified}
            totpCode={s.totpCode}
            onTotpCodeChange={s.onTotpCodeChange}
            totpError={s.totpError}
            totpVerifying={s.totpVerifying}
            onVerify={s.handleVerifyTotp}
            totpGraceMs={s.totpGraceMs}
            onGraceChange={s.setTotpGraceMs}
            onContinue={() => s.setStep(3)}
            onBack={() => s.setStep(1)}
          />
        )}
        {s.step === 3 && (
          <Step3RecoveryPhrase
            phrase={s.phrase}
            phraseCopied={s.phraseCopied}
            onCopyPhrase={s.handleCopyPhrase}
            onContinue={() => s.setStep(4)}
            onBack={() => s.setStep(2)}
          />
        )}
        {s.step === 4 && (
          <Step4ConfirmPhrase
            phraseConfirm={s.phraseConfirm}
            onPhraseConfirmChange={s.onPhraseConfirmChange}
            canContinue={s.canContinueStep4()}
            error={s.error}
            onContinue={() => s.canContinueStep4() ? s.setStep(5) : s.setError('La frase no coincide con la que generamos. Revísala.')}
            onBack={() => s.setStep(3)}
          />
        )}
        {s.step === 5 && (
          <Step5EmailVerification
            email={s.email}
            onEmailChange={s.onEmailChange}
            emailSent={s.emailSent}
            emailLoading={s.emailLoading}
            onSendEmail={s.handleSendEmail}
            emailCode={s.emailCode}
            onEmailCodeChange={s.onEmailCodeChange}
            onVerifyEmail={s.handleVerifyEmail}
            resendWait={s.resendWait}
            emailError={s.emailError}
            emailVerified={s.emailVerified}
            onSkip={() => s.setStep(6)}
            onContinue={() => s.setStep(6)}
            onBack={() => s.setStep(4)}
          />
        )}
        {s.step === 6 && (
          <Step6Summary
            authMethod={s.authMethod}
            emailVerified={s.emailVerified}
            email={s.email}
            fileDownloaded={s.fileDownloaded}
            onDownload={s.handleDownloadRecoveryFile}
            onFinish={s.handleFinish}
          />
        )}
      </div>
    </div>
  );
}
