import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons'
import { TopView } from '@renderer/components/TopView'
import { Button, Modal, Space, Spin, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ShowParams {
  url: string
  success: boolean
  error?: string
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

const PopupContainer: React.FC<Props> = ({ url, success, error, resolve }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
    resolve({})
  }

  const onClose = () => {
    resolve({})
  }

  return (
    <Modal
      title={t('settings.postgres.check_connection.title')}
      open={open}
      onOk={onOk}
      onCancel={onOk}
      afterClose={onClose}
      transitionName="animation-move-down"
      centered
      maskClosable={false}
      footer={[
        <Button key="submit" type="primary" onClick={onOk}>
          {t('common.confirm')}
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text strong>{t('settings.postgres.url')}:</Typography.Text>
        <Typography.Text>{url}</Typography.Text>
        <Space>
          <Typography.Text strong>{t('common.status')}:</Typography.Text>
          {success ? (
            <Space>
              <CheckCircleFilled style={{ color: '#52c41a' }} />
              <Typography.Text type="success">{t('message.api.connection.success')}</Typography.Text>
            </Space>
          ) : (
            <Space>
              <CloseCircleFilled style={{ color: '#ff4d4f' }} />
              <Typography.Text type="danger">{t('message.api.connection.failed')}</Typography.Text>
            </Space>
          )}
        </Space>
        {!success && error && (
          <Space direction="vertical">
            <Typography.Text strong>{t('common.error')}:</Typography.Text>
            <Typography.Text type="danger">{error}</Typography.Text>
          </Space>
        )}
      </Space>
    </Modal>
  )
}

export default class PostgresCheckPopup {
  static topviewId = 0
  static hide() {
    TopView.hide('PostgresCheckPopup')
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />,
        'PostgresCheckPopup'
      )
    })
  }
}
