import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import functools
import sqlalchemy as sa # Import sqlalchemy for text()

# Determine base directory for file paths
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, static_folder=os.path.join(basedir, 'frontend'))

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'backend', 'data', 'pes_projects_timeline.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db) # Initialize Flask-Migrate

# Define Database Models
class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.Text, nullable=False, unique=True)
    pes_lead = db.Column(db.Text)
    client_name = db.Column(db.Text)
    project_stage = db.Column(db.Text) # Stored as comma-separated string
    project_scope = db.Column(db.Text) # Stored as comma-separated string
    start_date = db.Column(db.Text)
    expected_end_date = db.Column(db.Text)
    status = db.Column(db.Text, nullable=False, default='active') # 'active' or 'completed'
    
    # New fields for project features
    location_district = db.Column(db.Text)
    dam_type = db.Column(db.Text)
    avg_annual_inflow_mcm = db.Column(db.Text)
    gross_storage_mcm = db.Column(db.Text)
    live_storage_mcm = db.Column(db.Text)
    ncl_m = db.Column(db.Text)
    dam_weir_height_m = db.Column(db.Text)
    crest_elevation = db.Column(db.Text)
    flood_q_cms = db.Column(db.Text)
    power_mw = db.Column(db.Text)
    cca_hectare = db.Column(db.Text)
    canal_q_cms_drinking_water_supply = db.Column(db.Text)
    catchment_area_sqkm = db.Column(db.Text)
    sediment_load_m3_sqkm_yr = db.Column(db.Text)
    project_cost_m_rs = db.Column(db.Text)

    # New fields for Survey/GI status and additional description
    survey_status = db.Column(db.Text) # 'Completed', 'InProgress', 'N/A'
    gi_status = db.Column(db.Text)     # 'Completed', 'InProgress', 'N/A'
    additional_description = db.Column(db.Text)

    # These fields will now reflect the latest ProjectUpdate's details
    last_updated_at = db.Column(db.Text, nullable=True) # Changed to nullable
    last_updated_by = db.Column(db.Text, nullable=True) # Changed to nullable

    updates = db.relationship('ProjectUpdate', backref='project', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'project_name': self.project_name,
            'pes_lead': self.pes_lead,
            'client_name': self.client_name,
            'project_stage': self.project_stage.split(',') if self.project_stage else [],
            'project_scope': self.project_scope.split(',') if self.project_scope else [],
            'start_date': self.start_date,
            'expected_end_date': self.expected_end_date,
            'status': self.status,
            'location_district': self.location_district,
            'dam_type': self.dam_type,
            'avg_annual_inflow_mcm': self.avg_annual_inflow_mcm,
            'gross_storage_mcm': self.gross_storage_mcm,
            'live_storage_mcm': self.live_storage_mcm,
            'ncl_m': self.ncl_m,
            'dam_weir_height_m': self.dam_weir_height_m,
            'crest_elevation': self.crest_elevation,
            'flood_q_cms': self.flood_q_cms,
            'power_mw': self.power_mw,
            'cca_hectare': self.cca_hectare,
            'canal_q_cms_drinking_water_supply': self.canal_q_cms_drinking_water_supply,
            'catchment_area_sqkm': self.catchment_area_sqkm,
            'sediment_load_m3_sqkm_yr': self.sediment_load_m3_sqkm_yr,
            'project_cost_m_rs': self.project_cost_m_rs,
            'survey_status': self.survey_status,
            'gi_status': self.gi_status,
            'additional_description': self.additional_description,
            'last_updated_at': self.last_updated_at, # This will now be driven by timeline updates
            'last_updated_by': self.last_updated_by, # This will now be driven by timeline updates
            'updates': [update.to_dict() for update in self.updates]
        }

class ProjectUpdate(db.Model):
    __tablename__ = 'project_updates'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    update_text = db.Column(db.Text, nullable=False) # Activity / Task
    status_progress_text = db.Column(db.Text) # Current Progress
    status_color = db.Column(db.Text, nullable=False) # 'Green', 'Orange', 'Red'
    updated_by = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Text, default=db.func.current_timestamp()) # Auto timestamp
    update_display_date = db.Column(db.Text, nullable=False) # User-selected date for display/sorting

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'update_text': self.update_text,
            'status_progress_text': self.status_progress_text,
            'status_color': self.status_color,
            'updated_by': self.updated_by,
            'created_at': self.created_at,
            'update_display_date': self.update_display_date # Include new field
        }

def init_db():
    """Ensures the data directory exists. Flask-Migrate handles table creation/migrations."""
    os.makedirs(os.path.join(basedir, 'backend', 'data'), exist_ok=True)
    # Flask-Migrate (Alembic) will manage table creation and schema changes.
    # We no longer call db.create_all() here. It's done via 'flask db upgrade'.
    print("Database directory ensured. Use 'flask db migrate' and 'flask db upgrade' for schema management.")

# Admin password (for demonstration purposes, in a real app this would be hashed and secured)
ADMIN_PASSWORD = "6565" # Ensure this matches frontend's ADMIN_PASSWORD

# Decorator for admin-protected routes
def admin_required(f):
    @functools.wraps(f) # Important for Flask to recognize unique endpoints
    def decorated_function(*args, **kwargs):
        data = request.get_json()
        if not data or data.get('admin_password') != ADMIN_PASSWORD:
            return jsonify({'message': 'Unauthorized: Admin password required or incorrect'}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- API Endpoints ---

@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    try:
        projects = Project.query.all()
        return jsonify([p.to_dict() for p in projects])
    except Exception as e:
        print(f"Error in get_all_projects: {e}")
        return jsonify({'message': 'Failed to retrieve projects'}), 500

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    try:
        project = Project.query.get_or_404(project_id)
        return jsonify(project.to_dict())
    except Exception as e:
        print(f"Error in get_project: {e}")
        return jsonify({'message': 'Failed to retrieve project details'}), 500

@app.route('/api/admin/projects', methods=['POST'])
@admin_required
def create_project():
    data = request.get_json()
    required_fields = ['project_name', 'pes_lead', 'client_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing required field: {field}'}), 400

    if Project.query.filter_by(project_name=data['project_name']).first():
        return jsonify({'message': 'Project with this name already exists'}), 409

    new_project = Project(
        project_name=data['project_name'],
        pes_lead=data.get('pes_lead'),
        client_name=data.get('client_name'),
        project_stage=','.join(data.get('project_stage', [])) if data.get('project_stage') else None, # Store as comma-separated or None
        project_scope=','.join(data.get('project_scope', [])) if data.get('project_scope') else None, # Store as comma-separated or None
        start_date=data.get('start_date'),
        expected_end_date=data.get('expected_end_date'),
        status='active', # New projects are active by default
        
        # New detailed features
        location_district=data.get('location_district'),
        dam_type=data.get('dam_type'),
        avg_annual_inflow_mcm=data.get('avg_annual_inflow_mcm'),
        gross_storage_mcm=data.get('gross_storage_mcm'),
        live_storage_mcm=data.get('live_storage_mcm'),
        ncl_m=data.get('ncl_m'),
        dam_weir_height_m=data.get('dam_weir_height_m'),
        crest_elevation=data.get('crest_elevation'),
        flood_q_cms=data.get('flood_q_cms'),
        power_mw=data.get('power_mw'),
        cca_hectare=data.get('cca_hectare'),
        canal_q_cms_drinking_water_supply=data.get('canal_q_cms_drinking_water_supply'),
        catchment_area_sqkm=data.get('catchment_area_sqkm'),
        sediment_load_m3_sqkm_yr=data.get('sediment_load_m3_sqkm_yr'),
        project_cost_m_rs=data.get('project_cost_m_rs'),
        survey_status=data.get('survey_status'),
        gi_status=data.get('gi_status'),
        additional_description=data.get('additional_description'),
        
        # Initialize these as None; they will be updated by status updates
        last_updated_at=None,
        last_updated_by=None
    )

    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

@app.route('/api/admin/projects/<int:project_id>', methods=['PUT'])
@admin_required
def edit_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    # Update project fields if provided in the request
    project.project_name = data.get('project_name', project.project_name)
    project.pes_lead = data.get('pes_lead', project.pes_lead)
    project.client_name = data.get('client_name', project.client_name)
    project.project_stage = ','.join(data.get('project_stage', project.project_stage.split(',') if project.project_stage else [])) if 'project_stage' in data else project.project_stage
    project.project_scope = ','.join(data.get('project_scope', project.project_scope.split(',') if project.project_scope else [])) if 'project_scope' in data else project.project_scope
    project.start_date = data.get('start_date', project.start_date)
    project.expected_end_date = data.get('expected_end_date', project.expected_end_date)
    # Status is updated via /complete endpoint, not here.

    project.location_district = data.get('location_district', project.location_district)
    project.dam_type = data.get('dam_type', project.dam_type)
    project.avg_annual_inflow_mcm = data.get('avg_annual_inflow_mcm', project.avg_annual_inflow_mcm)
    project.gross_storage_mcm = data.get('gross_storage_mcm', project.gross_storage_mcm)
    project.live_storage_mcm = data.get('live_storage_mcm', project.live_storage_mcm)
    project.ncl_m = data.get('ncl_m', project.ncl_m)
    project.dam_weir_height_m = data.get('dam_weir_height_m', project.dam_weir_height_m)
    project.crest_elevation = data.get('crest_elevation', project.crest_elevation)
    project.flood_q_cms = data.get('flood_q_cms', project.flood_q_cms)
    project.power_mw = data.get('power_mw', project.power_mw)
    project.cca_hectare = data.get('cca_hectare', project.cca_hectare)
    project.canal_q_cms_drinking_water_supply = data.get('canal_q_cms_drinking_water_supply', project.canal_q_cms_drinking_water_supply)
    project.catchment_area_sqkm = data.get('catchment_area_sqkm', project.catchment_area_sqkm)
    project.sediment_load_m3_sqkm_yr = data.get('sediment_load_m3_sqkm_yr', project.sediment_load_m3_sqkm_yr)
    project.project_cost_m_rs = data.get('project_cost_m_rs', project.project_cost_m_rs)
    project.survey_status = data.get('survey_status', project.survey_status)
    project.gi_status = data.get('gi_status', project.gi_status)
    project.additional_description = data.get('additional_description', project.additional_description)

    # last_updated_at and last_updated_by are NOT updated here. They are only updated by status updates.
    
    db.session.commit()
    return jsonify(project.to_dict())

@app.route('/api/admin/projects/<int:project_id>/complete', methods=['PUT'])
@admin_required
def complete_project(project_id):
    project = Project.query.get_or_404(project_id)
    project.status = 'completed'
    db.session.commit()
    return jsonify({'message': f'Project {project_id} marked as completed'}), 200

@app.route('/api/admin/projects/<int:project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    
    # Store data for undo functionality BEFORE deletion
    deleted_project_data = project.to_dict() # This will also include updates due to relationship.
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': f'Project {project_id} deleted', 'deleted_project': deleted_project_data}), 200

@app.route('/api/projects/<int:project_id>/updates', methods=['POST'])
def add_status_update(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    required_fields = ['update_text', 'status_color', 'updated_by', 'update_display_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing required field for update: {field}'}), 400

    new_update = ProjectUpdate(
        project_id=project_id,
        update_text=data.get('update_text'),
        status_progress_text=data.get('status_progress_text'),
        status_color=data.get('status_color'),
        updated_by=data.get('updated_by'),
        update_display_date=data.get('update_display_date')
    )
    
    db.session.add(new_update)
    db.session.commit()

    # Update the project's last_updated_at and last_updated_by to reflect this new status update
    project.last_updated_at = new_update.created_at # Use DB-generated timestamp for consistency
    project.last_updated_by = new_update.updated_by
    db.session.commit()

    return jsonify(new_update.to_dict()), 201

@app.route('/api/project_updates/<int:update_id>', methods=['PUT'])
@admin_required
def edit_status_update(update_id):
    update_obj = ProjectUpdate.query.get_or_404(update_id)
    data = request.get_json()

    update_obj.update_text = data.get('update_text', update_obj.update_text)
    update_obj.status_progress_text = data.get('status_progress_text', update_obj.status_progress_text)
    update_obj.status_color = data.get('status_color', update_obj.status_color)
    update_obj.updated_by = data.get('updated_by', update_obj.updated_by)
    update_obj.update_display_date = data.get('update_display_date', update_obj.update_display_date)
    # created_at (timestamp) is not updated on edit

    db.session.commit()

    # After editing an update, refresh the parent project's last_updated_at/by based on the project's overall latest update
    project = Project.query.get(update_obj.project_id)
    latest_update_for_project = ProjectUpdate.query.filter_by(project_id=project.id).order_by(ProjectUpdate.created_at.desc()).first()

    if latest_update_for_project:
        project.last_updated_at = latest_update_for_project.created_at
        project.last_updated_by = latest_update_for_project.updated_by
    else:
        # If somehow all updates were deleted (future feature) or none exist, reset project's last updated info
        project.last_updated_at = None
        project.last_updated_by = None
    db.session.commit()

    return jsonify(update_obj.to_dict())

# Serve static files (HTML, CSS, JS)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'timeline.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Prevent serving backend files directly
    if 'backend' in filename:
        return "Access Denied", 403
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    init_db() # Ensure data directory exists
    # When using waitress-serve, this block is typically not run.
    # It's here for direct 'python run.py' execution for development convenience.
    from waitress import serve
    print("Starting Flask application...")
    print("Serving with Waitress on http://192.168.0.3:8000")
    serve(app, host='192.168.0.3', port=8000)

