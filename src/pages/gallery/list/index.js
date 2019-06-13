/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Select, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import renderHTML from 'react-render-html'
import { handleFilterGallery } from '../../../services/custom'

import './index.css'

const { Option } = Select

@connect(({ gallery }) => ({ gallery }))
class GalleryList extends React.Component {
  state = {
    galleryYear: '2019',
    language: true,
  }

  componentDidMount() {
    const { dispatch, location } = this.props
    const { state } = location

    if (state !== undefined) {
      if (state.galleryYear) {
        this.setState(
          {
            galleryYear: state.galleryYear,
          },
          () => {
            const body = {
              gallery: this.state.galleryYear,
            }
            dispatch({
              type: 'gallery/GET_SUB_GALLERY',
              body,
            })
            dispatch({
              type: 'gallery/GET_GALLERY_LIST',
            })
          },
        )
      }
    } else {
      const body = {
        gallery: this.state.galleryYear,
      }
      dispatch({
        type: 'gallery/GET_SUB_GALLERY',
        body,
      })
      dispatch({
        type: 'gallery/GET_GALLERY_LIST',
      })
    }
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
    // this.setState({
    //   language: window.localStorage['app.settings.locale'] === '"en-US"',
    // })
  }

  hadleSelectGallery = gallery => {
    const { dispatch } = this.props
    this.setState(
      {
        galleryYear: gallery,
      },
      () => {
        const body = {
          gallery: this.state.galleryYear,
        }
        dispatch({
          type: 'gallery/GET_SUB_GALLERY',
          body,
        })
      },
    )
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

  hanldeRedirect = record => {
    const { history } = this.props
    const { language } = this.state
    history.push({
      pathname: '/gallery/create',
      state: { id: record.uuid, language },
    })
  }

  render() {
    const { gallery } = this.props
    const { mainGallery, subGallery, totalSubGallery } = gallery
    const { language, galleryYear } = this.state
    const mainGalleryFiltered = handleFilterGallery(mainGallery)
    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'title_en' : 'title_ru',
        key: 'title_en',
        render: title => (title ? renderHTML(title.substring(0, 50)) : ''),
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
            <Link to={{ pathname: '/gallery/create', state: { id: record.uuid, language } }}>
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
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
          <div className="card-header mb-3">
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
                // defaultValue="2019"
                value={galleryYear}
                showSearch
                style={{ width: '20%' }}
                onChange={this.hadleSelectGallery}
                placeholder="Select Gallery"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {mainGalleryFiltered && mainGalleryFiltered.length > 0
                  ? mainGalleryFiltered.map(item => {
                      return (
                        <Option value={item.name_en}>
                          {language ? item.name_en : item.name_ru}
                        </Option>
                      )
                    })
                  : null}
              </Select>
            </div>
          </div>
          <div className="card-body">
            <Table
              // eslint-disable-next-line no-underscore-dangle
              rowKey={record => record._id}
              rowClassName={record =>
                record.translation_required === true ? 'NotTranslated' : 'translated'
              }
              onRow={record => {
                return {
                  onDoubleClick: () => {
                    this.hanldeRedirect(record)
                  },
                }
              }}
              className="utils__scrollTable customTable"
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
    )
  }
}

export default GalleryList
