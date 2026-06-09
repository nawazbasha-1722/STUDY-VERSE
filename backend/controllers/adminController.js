import User from '../models/User.js';
import Note from '../models/Note.js';
import DiscussionRoom from '../models/DiscussionRoom.js';

// @desc    Get global ERP analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getSystemAnalytics = async (req, res) => {
  try {
    // 1. User counters
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // 2. Notes metrics
    const notesCount = await Note.countDocuments();
    const downloadMetrics = await Note.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloadsCount' } } },
    ]);
    const totalDownloads = downloadMetrics.length > 0 ? downloadMetrics[0].totalDownloads : 0;

    // 3. GPA average stats
    const gpaStats = await User.aggregate([
      { $match: { role: 'student', 'gpaStats.cgpa': { $gt: 0 } } },
      { $group: { _id: null, avgCgpa: { $avg: '$gpaStats.cgpa' } } },
    ]);
    const avgCgpa = gpaStats.length > 0 ? parseFloat(gpaStats[0].avgCgpa.toFixed(2)) : 0;

    // 4. Placements stats
    const placementStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: null,
          avgCodingSolved: { $avg: '$placementMetrics.codingSolved' },
          avgAptitudeSolved: { $avg: '$placementMetrics.aptitudeSolved' },
          avgMockInterviews: { $avg: '$placementMetrics.mockInterviews' },
        },
      },
    ]);

    const activeRoomsCount = await DiscussionRoom.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          students: studentCount,
          faculties: facultyCount,
          admins: adminCount,
          total: studentCount + facultyCount + adminCount,
        },
        notes: {
          totalNotes: notesCount,
          totalDownloads,
        },
        academic: {
          averageCgpa: avgCgpa,
        },
        placement: {
          codingSolvedAvg: placementStats.length > 0 ? Math.round(placementStats[0].avgCodingSolved) : 0,
          aptitudeSolvedAvg: placementStats.length > 0 ? Math.round(placementStats[0].avgAptitudeSolved) : 0,
          mockInterviewsAvg: placementStats.length > 0 ? Math.round(placementStats[0].avgMockInterviews) : 0,
        },
        discussions: {
          activeRooms: activeRoomsCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error consolidating analytics',
    });
  }
};
