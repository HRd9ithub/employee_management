                    {/* leave box */}
                    <div className='notification-box'>
                      {leaveNotification.sort(function (a, b) {
                        return new Date(b.from_date) - new Date(a.from_date)
                      }).map((elem) => {
                        return (
                          <div key={elem._id}>
                            <Dropdown.Item className="dropdown-item preview-item" onClick={evt => {
                              evt.preventDefault()
                              changeStatus(elem._id)
                            }}>
                              <div className="preview-thumbnail">
                                <div className="preview-icon bg-success">
                                  {elem.user && elem.user.profile_image &&
                                    // eslint-disable-next-line
                                    <Avatar alt={elem.user.first_name} className='text-capitalize' src={`${elem.user.profile_image && process.env.REACT_APP_IMAGE_API}/${elem.user.profile_image}`} sx={{ width: 30, height: 30 }} />}
                                </div>
                              </div>
                              <div className="preview-item-content d-flex align-items-start flex-column justify-content-center w-100">
                                <div className='d-flex justify-content-between w-100' style={{ gap: "50px" }}>
                                  <h6 className="preview-subject font-weight-normal mb-1">{elem.user ? elem.user.first_name.concat(" ", elem.user.last_name) : <HiOutlineMinus />}</h6>
                                  <small style={{ color: '#aaaa', marginTop: '3px' }}>{timeAgo(elem.createdAt)}</small>
                                </div>
                                <p className="text-gray ellipsis mb-0">
                                  {elem.leaveType} Request
                                </p>
                              </div>
                            </Dropdown.Item>
                          </div>
                        )
                      })}
                    </div>
                    {/* report request box */}
                    <div className='notification-box'>
                      {reportRequest.map((elem) => {
                        return (
                          <div key={elem._id}>
                            <Dropdown.Item className="dropdown-item preview-item request-report-dropdrown" onClick={evt => {
                              evt.preventDefault()
                              handleDeleteRequestReportClick(elem._id)
                            }}>
                              <div className="preview-thumbnail">
                                <div className="preview-icon bg-success">
                                  {elem.user && elem.user.profile_image &&
                                    // eslint-disable-next-line
                                    <Avatar alt={elem.user.first_name} className='text-capitalize' src={`${elem.user.profile_image && process.env.REACT_APP_IMAGE_API}/${elem.user.profile_image}`} sx={{ width: 30, height: 30 }} />}
                                </div>
                              </div>
                              <div className="preview-item-content d-flex align-items-start flex-column justify-content-center w-100">
                                <div className='d-flex justify-content-between w-100' style={{ gap: "50px" }}>
                                  <h6 className="preview-subject font-weight-normal mb-1">{elem.user ? elem.user.first_name.concat(" ", elem.user.last_name) : <HiOutlineMinus />}</h6>
                                  <small style={{ color: '#aaaa', marginTop: '3px' }}>{timeAgo(elem.createdAt)}</small>
                                </div>
                                <p className="text-gray ellipsis mb-0">
                                  {moment(elem.date).format("DD MMM YYYY")} - {elem.title}
                                </p>
                                <p className="text-gray mb-0 w-100 text-wrap notification-description">
                                {/* {elem.description} */}
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ex, dolor quisquam recusandae nulla ullam, distinctio repellat voluptatem ea doloremque, provident eveniet sapiente obcaecati. Id quod animi iusto labore a corrupti accusamus eligendi eveniet ab! Non pariatur excepturi omnis, amet veritatis sed, ex perferendis ab et blanditiis nesciunt, ipsam asperiores at voluptates beatae officia hic porro minima tempora consequuntur voluptas quo. Quo odio expedita veritatis qui, labore sapiente! Minima aliquam ad quos quibusdam neque commodi perferendis dolor illo. Alias vitae ipsam qui dolore, excepturi earum exercitationem deleniti rem, nemo incidunt sit neque numquam omnis a tenetur repellendus laudantium corrupti aliquam officiis.
                                </p>
                              </div>
                            </Dropdown.Item>
                          </div>
                        )
                      })}
                    </div>