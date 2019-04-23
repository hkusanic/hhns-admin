/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Select, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

const { Option } = Select

@connect(({ gallery }) => ({ gallery }))
class GalleryList extends React.Component {
  state = {
    gallery: '2019',
    language: true,
  }

  componentDidMount() {
    const { dispatch } = this.props
    const body = {
      gallery: '2019',
    }
    dispatch({
      type: 'gallery/GET_SUB_GALLERY',
      body,
    })
    dispatch({
      type: 'gallery/GET_GALLERY_LIST',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gallery.isDeleted) {
      const { dispatch } = this.props
      const { gallery } = this.state
      const body = {
        gallery,
      }
      dispatch({
        type: 'gallery/GET_SUB_GALLERY',
        body,
      })
    }
  }

  hadleSelectGallery = gallery => {
    const { dispatch } = this.props
    this.setState({
      gallery,
    })
    const body = {
      gallery,
    }
    dispatch({
      type: 'gallery/GET_SUB_GALLERY',
      body,
    })
  }

  handleDeleteGallery = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'gallery/REMOVE_GALLERY',
      uuid,
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  render() {
    const { gallery } = this.props
    const { mainGallery, subGallery, totalSubGallery } = gallery
    const { language } = this.state

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'title_en' : 'title_ru',
        key: 'title_en',
        render: title => <span>{title}</span>,
      },
      {
        title: 'Need Translation',
        dataIndex: 'translation_required',
        key: 'translation_required',
        render: type => <span>{`${type}`}</span>,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },

      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link to={{ pathname: '/gallery/create', state: record.uuid }}>
              <i className="fa fa-edit mr-2" />
            </Link>
            <i
              className="fa fa-trash mr-2"
              onClick={() => {
                this.handleDeleteGallery(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]
    return (
      <div>
        <Helmet title="Gallery List" />
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Gallery List</strong>
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            <div style={{ paddingTop: '10px' }}>
              <strong style={{ paddingRight: '20px' }}>Select Gallery</strong>
              <Select
                id="gallery-item"
                defaultValue="2019"
                showSearch
                style={{ width: '20%' }}
                onChange={this.hadleSelectGallery}
                placeholder="Select Gallery"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {mainGallery && mainGallery.length > 0
                  ? mainGallery.map(item => {
                      return (
                        <Option value={item.name_en}>
                          {language ? item.name_en : item.name_ru}
                        </Option>
                      )
                    })
                  : null}
              </Select>
            </div>
            <div className="card-body">
              <Table
                rowClassName={record =>
                  record.translation_required === true ? 'NotTranslated' : 'translated'
                }
                className="utils__scrollTable"
                scroll={{ x: '100%' }}
                columns={columns}
                dataSource={subGallery}
                pagination={{
                  pageSize: 20,
                  total: totalSubGallery,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default GalleryList
