import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import { styled } from "@mui/system";
import { FaGithub, FaLinkedin, FaTwitter, FaCamera } from "react-icons/fa";
import { MdExpandMore, MdEdit, MdWork, MdSchool } from "react-icons/md";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: 8,
  padding: 24,
  maxWidth: 500,
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto"
}));

const UserProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "Michael",
    lastName: "Johnson",
    userId: "MJ789012",
    email: "michael.johnson@example.com",
    phone: "+1 (555) 123-4567",
    occupation: "Senior Software Engineer",
    bankName: "Chase Bank",
    accountId: "****5678",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    address: "123 Tech Street, Silicon Valley, CA 94025",
    department: "Engineering",
    employeeId: "EMP-2023-001",
    joiningDate: "2020-01-15",
    designation: "Tech Lead",
    purchaseHistory: [
      {
        id: 1,
        item: "Premium Subscription",
        date: "2023-12-01",
        amount: "$49.99"
      },
      {
        id: 2,
        item: "Course Bundle",
        date: "2023-11-15",
        amount: "$199.99"
      }
    ],
    experience: [
      {
        company: "Tech Corp",
        position: "Senior Developer",
        duration: "2020 - Present"
      },
      {
        company: "Innovation Labs",
        position: "Full Stack Developer",
        duration: "2018 - 2020"
      }
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Master's in Computer Science",
        year: "2018"
      }
    ],
    skills: ["React", "Node.js", "Python", "AWS", "Docker"],
    certifications: ["AWS Certified Developer", "Google Cloud Professional"],
    social: {
      github: "github.com/michaeljohnson",
      linkedin: "linkedin.com/in/michaeljohnson",
      twitter: "twitter.com/michaeljohnson"
    }
  });

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const PaymentHistory = () => (
    <Grid item xs={12}>
      <Accordion>
        <AccordionSummary expandIcon={<MdExpandMore />}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
            Payment History
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {profileData.purchaseHistory.map((purchase) => (
              <ListItem key={purchase.id} divider>
                <ListItemText
                  primary={purchase.item}
                  secondary={purchase.date}
                />
                <ListItemSecondaryAction>
                  <Typography variant="subtitle1" color="primary">
                    {purchase.amount}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: "#f5f5f5" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: "center" }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={profileData.avatar}
                  alt={profileData.fullName}
                  sx={{ width: 150, height: 150, mb: 2, margin: "0 auto" }}
                />
                <input
                  accept="image/*"
                  type="file"
                  id="avatar-upload"
                  hidden
                  onChange={handleAvatarChange}
                />
                <IconButton
                  component="label"
                  htmlFor="avatar-upload"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "#fff"
                  }}
                >
                  <FaCamera />
                </IconButton>
              </Box>
              <Typography variant="h5" gutterBottom>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                User ID: {profileData.userId}
              </Typography>
              <Button
                variant="contained"
                startIcon={<MdEdit />}
                onClick={handleEditProfile}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                    <MdWork sx={{ mr: 1 }} /> Work Experience
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {profileData.experience.map((exp, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {exp.position}
                      </Typography>
                      <Typography color="textSecondary">
                        {exp.company} | {exp.duration}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                    <MdSchool sx={{ mr: 1 }} /> Education
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {profileData.education.map((edu, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {edu.degree}
                      </Typography>
                      <Typography color="textSecondary">
                        {edu.institution} | {edu.year}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>

            <PaymentHistory />

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {profileData.skills.map((skill, index) => (
                      <Chip key={index} label={skill} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Social Links
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <IconButton href={profileData.social.github} target="_blank">
                      <FaGithub />
                    </IconButton>
                    <IconButton href={profileData.social.linkedin} target="_blank">
                      <FaLinkedin />
                    </IconButton>
                    <IconButton href={profileData.social.twitter} target="_blank">
                      <FaTwitter />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <StyledModal open={isEditModalOpen} onClose={handleModalClose}>
        <ModalContent>
          <Typography variant="h6" gutterBottom>Edit Profile</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) =>
                  setProfileData({ ...profileData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) =>
                  setProfileData({ ...profileData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                value={profileData.userId}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bank Name"
                value={profileData.bankName}
                onChange={(e) =>
                  setProfileData({ ...profileData, bankName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account ID"
                value={profileData.accountId}
                onChange={(e) =>
                  setProfileData({ ...profileData, accountId: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Occupation"
                value={profileData.occupation}
                onChange={(e) =>
                  setProfileData({ ...profileData, occupation: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee ID"
                value={profileData.employeeId}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Designation"
                value={profileData.designation}
                onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleModalClose}>
              Save Changes
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>
    </Container>
  );
};

export default UserProfile;